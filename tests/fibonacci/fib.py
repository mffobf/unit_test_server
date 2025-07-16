def fib_iter(n: int) -> int:
    """Iterative loop – O(n) time, O(1) space."""
    if n < 0:
        raise ValueError("n must be ≥ 0")
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def fib_rec(n: int) -> int:
    """Naïve recursion – O(φⁿ) time, O(n) stack (for demo only)."""
    if n < 0:
        raise ValueError("n must be ≥ 0")
    if n < 2:
        return n
    return fib_rec(n - 1) + fib_rec(n - 2)


def fib_fast(n: int) -> int:
    """Fast-doubling – O(log n) time, O(log n) space (recursion depth)."""
    if n < 0:
        raise ValueError("n must be ≥ 0")

    def _fd(k: int):
        if k == 0:
            return (0, 1)            # (F(k), F(k+1))
        a, b = _fd(k >> 1)
        c = a * (2 * b - a)          # F(2k)
        d = a * a + b * b            # F(2k+1)
        return (d, c + d) if k & 1 else (c, d)

    return _fd(n)[0]


def fib_mat(n: int) -> int:
    """Matrix exponentiation – O(log n) time, O(1) space."""
    if n < 0:
        raise ValueError("n must be ≥ 0")

    def mul(m1, m2):
        a, b, c, d = m1
        e, f, g, h = m2
        return (
            a * e + b * g, a * f + b * h,
            c * e + d * g, c * f + d * h,
        )

    result = (1, 0, 0, 1)   # Identity matrix
    base = (1, 1, 1, 0)   # Q-matrix
    k = n
    while k:
        if k & 1:
            result = mul(result, base)
        base = mul(base, base)
        k >>= 1
    return result[1]        # F(n) is element (0,1)
