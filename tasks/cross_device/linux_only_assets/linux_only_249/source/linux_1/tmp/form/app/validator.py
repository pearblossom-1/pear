import re


def is_approval_code(value):
    return re.fullmatch(r"app-\d{3,4}", str(value), flags=re.IGNORECASE) is not None
