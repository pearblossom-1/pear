def merge(base, environment, override):
    result = dict(override)
    result.update(environment)
    result.update(base)
    return result
