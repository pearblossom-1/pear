# Core 007 — `l2_csv_to_json`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 7 项
- 任务文件：`tasks/cross_device/real100/l2_csv_to_json.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 设备拓扑：`2L`（`linux_0`、`linux_1`）
- 限制：最多 20 步，最长 180 秒

## 1. Instruction

### 英文原文（逐字）

```text
`/tmp/orders/orders.csv` on the first Linux machine contains today's orders. Please convert it to `/tmp/orders/orders.json` on the second Linux machine.
```

### 中文翻译

第一台 Linux 机器上的 `/tmp/orders/orders.csv` 包含今天的订单。请将其转换为第二台 Linux 机器上的 `/tmp/orders/orders.json`。

## 2. 输入、附件与初始业务数据

### 2.1 CSV 附件

- 仓库源文件：`tasks/cross_device/real100_assets/l2_csv_to_json/source/orders.csv`
- 注入路径：`linux_0:/tmp/orders/orders.csv`
- 完整内容：

```csv
order_id,customer,item,qty,rush
ORD-100,Aster Supply,filter kit,3,yes
ORD-101,Harbor Electric,cable reel,1,no
ORD-102,Northline Parts,valve pack,5,yes
```

### 2.2 预期输出

- `linux_1:/tmp/orders/orders.json`

没有短信、邮件、图片、音频或其他附件。

## 3. Setup 具体流程

### `linux_0`

1. 执行 `rm -rf /tmp/orders && mkdir -p /tmp/orders`。
2. 上传 `orders.csv`。

### `linux_1`

1. 同样重建 `/tmp/orders`。
2. 不预置 `orders.json`。

Cleanup 删除两台 Linux 的 `/tmp/orders`。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

`orders.json` 中必须完整保留 CSV 的 3 个订单，不能多、不能少，也不能把字段放错订单。

最直观的写法是：

```json
{
  "orders": [
    {"order_id": "ORD-100", "customer": "Aster Supply", "item": "filter kit", "qty": 3, "rush": "yes"},
    {"order_id": "ORD-101", "customer": "Harbor Electric", "item": "cable reel", "qty": 1, "rush": "no"},
    {"order_id": "ORD-102", "customer": "Northline Parts", "item": "valve pack", "qty": 5, "rush": "yes"}
  ]
}
```

订单前后顺序可以变化。漏订单、多订单、客户与商品对错行、添加额外业务字段或写出重复 JSON key 都会失败。

- `func`：`check_json_records`
- getter：`vm_file`，读取 `/tmp/orders/orders.json`
- 匹配性质：先严格解析 JSON，再把输出规范化为记录多重集合；不是 JSON 文本绝对相等，记录顺序不计。

### 4.1 接受的顶层形状

以下常见形状都可表示同一结果：

1. 带 `orders` 的数组：

```json
{"orders": [{"order_id": "ORD-100", "customer": "Aster Supply", "item": "filter kit", "qty": "3", "rush": "yes"}]}
```

2. 根数组：

```json
[{"order_id": "ORD-100", "customer": "Aster Supply", "item": "filter kit", "qty": "3", "rush": "yes"}]
```

3. 用订单 ID 作对象 key 的映射；内层可省略 ID：

```json
{
  "ORD-100": {"customer": "Aster Supply", "item": "filter kit", "qty": "3", "rush": "yes"}
}
```

也可在 `orders` 下使用 ID-keyed 映射。

### 4.2 精确记录合同

规范列为 `order_id, customer, item, qty, rush`，必须得到以下 3 条记录且多重性完全一致：

| order_id | customer | item | qty | rush |
|---|---|---|---|---|
| ORD-100 | Aster Supply | filter kit | 3 | yes |
| ORD-101 | Harbor Electric | cable reel | 1 | no |
| ORD-102 | Northline Parts | valve pack | 5 | yes |

实现细节：

1. JSON 对象中的重复 key 会在解析阶段被明确拒绝。
2. 数组记录必须恰好提供一个非空 ID 字段，可用 `order_id` 或别名 `id`；同时提供两个非空 ID 会失败。
3. ID-keyed 映射中，若内层又写 `order_id`/`id`，其值必须与外层 key 一致。
4. 每条记录不能包含合同以外的额外字段；缺失业务字段会被规范为空字符串并与期望不符。
5. 输出必须恰好 3 条记录。比较使用 `Counter`，所以数组顺序不重要，但重复一条并漏掉另一条仍会失败。
6. 比较会折叠值的连续空白；`case_sensitive=true`，因此订单号、客户和商品文字的大小写必须保持。
7. `rush` 有值别名：
   - `yes` 也接受 `true` 或 `1`；JSON 布尔 `true` 和数字 `1` 会经字符串规范化后落入该组。
   - `no` 也接受 `false` 或 `0`。
8. `qty` 等值会转换为字符串比较，因此 JSON 数字 `3` 与字符串 `"3"` 在此记录合同下等价。

### 4.3 不评测的内容

- 不要求 JSON 缩进、字段顺序或记录顺序。
- 不要求一定使用顶层 `orders` key。
- 不检查转换命令、程序语言或中间文件。
