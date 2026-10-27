PYTHON := .venv/bin/python
PIP := .venv/bin/pip

.PHONY: install install-runtime run test smoke clean

install:
	$(PIP) install -e ".[dev]"

install-runtime:
	$(PIP) install torch==2.8.0 torchaudio==2.8.0
	$(PIP) install -e ".[runtime]"

run:
	$(PYTHON) main.py

test:
	$(PYTHON) -m pytest -q

smoke:
	$(PYTHON) -m compileall src main.py

clean:
	find . -type d -name "__pycache__" -prune -exec rm -rf {} +
	rm -rf .pytest_cache
