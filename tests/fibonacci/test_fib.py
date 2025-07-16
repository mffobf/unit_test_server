import pytest
from fib import fib_fast, fib_iter, fib_mat, fib_rec

CASES_ALL = [
    (0, 0),
    (1, 1),
    (2, 1),
    (3, 2),
    (4, 3),
    (5, 5),
    (6, 8),
    (7, 13),
    (8, 21),
    (9, 34),
    (10, 55),
    (15, 610),
    (20, 6765),
    (25, 75025),
    (30, 832040),
    (35, 9227465),
    (40, 102334155),

     # --- large cases ---
    (45, 1134903170),
    (50, 12586269025),
    (55, 139583862445),
    (60, 1548008755920),
    (65, 17167680177565),
    (70, 190392490709135),
    (75, 2111485077978050),
    (80, 23416728348467685),
    (85, 259695496911122585),
    (90, 2880067194370816120),
    (100, 354224848179261915075),
    (120, 5358359254990966640871840),
    (150, 9969216677189303386214405760200),
    (200, 280571172992510140037611932413038677189525)
]

# Split out a “small” subset so the naive recursive version finishes quickly
CASES_SMALL = [(n, v) for n, v in CASES_ALL if n <= 50]


@pytest.mark.parametrize("n, expected", CASES_ALL)
def test_iter(n, expected):
    assert fib_iter(n) == expected


@pytest.mark.parametrize("n, expected", CASES_SMALL)
def test_rec(n, expected):
    assert fib_rec(n) == expected


@pytest.mark.parametrize("n, expected", CASES_ALL)
def test_fast(n, expected):
    assert fib_fast(n) == expected


@pytest.mark.parametrize("n, expected", CASES_ALL)
def test_mat(n, expected):
    assert fib_mat(n) == expected
