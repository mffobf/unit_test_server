# unit_test_server/test_discovery.py
import os, glob, ast
from unit_test_server.config import TESTS_PATH

def discover_tests():
    tests = {}
    test_root = TESTS_PATH
    if not os.path.isdir(test_root):
        return tests
    
    # Walk through test directories
    for group_dir in os.listdir(test_root):
        group_path = os.path.join(test_root, group_dir)
        if os.path.isdir(group_path):
            tests[group_dir] = {}
            
            # Find all test files in the group
            for test_file in glob.glob(os.path.join(group_path, 'test_*.py')):
                file_name = os.path.basename(test_file)
                test_functions = []
                
                # Parse the file to find test functions
                try:
                    with open(test_file, 'r') as f:
                        tree = ast.parse(f.read())
                        for node in ast.walk(tree):
                            if isinstance(node, ast.FunctionDef) and node.name.startswith('test_'):
                                test_functions.append(node.name)
                except Exception as e:
                    print(f"Error parsing {test_file}: {e}")
                
                if test_functions:
                    tests[group_dir][file_name] = test_functions
    
    return tests
