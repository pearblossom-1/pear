# Core 064 — `linux_android_1037`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1037.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`；拓扑 `2A+1L`
- 限制：50 步 / 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
Use the approval note on the first phone together with `/tmp/sites/site_registry.csv` and `/tmp/sites/handoff_policy.md`. Add the approved site to OsmAnd Favorites on the second phone without disturbing the existing reference favorite. Then leave a concise handoff in Markor at `/storage/emulated/0/Documents/Markor/1037-A_handoff.md` that identifies the case, owner, approval code, site, coordinates, and confirms the favorite is ready.
```

### 中文翻译

用第一部手机 approval note、site registry 和 policy，在第二部手机 OsmAnd 添加 approved site 且不扰动已有 reference favorite；再写 Markor handoff，包含 case/owner/code/site/coordinates 和 ready。

## 2. 数据、Setup 与评测

Phone：1037-A/NX03781/Priya Shah/approved。Registry 匹配 `North Service Gate,37.7812,-122.4018`；South Service Gate hold 是干扰。

两项评分：OsmAnd favorite-set 实际要求 `North Service Gate` 及坐标；Markor 必须含所有实体并肯定说 favorite added/ready，禁止 not added/pending/blocked/1037-D。

配置边界：setup 初始化 OsmAnd 后又删除 public/backup favorites 文件，没有明确预置一个“existing reference favorite”；evaluator 描述也只列新站点。因此 instruction 中“保留 reference favorite”缺少可见具体对象，当前直接评分集中在新 favorite 与 handoff note。

