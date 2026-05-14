import socket
import sys

def test_port(port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.bind(("0.0.0.0", port))
        s.listen(1)
        print(f"Port {port} is FREE and can be bound.")
        s.close()
        return True
    except Exception as e:
        print(f"Port {port} is BUSY or cannot be bound. Error: {e}")
        return False

if __name__ == "__main__":
    test_port(5000)
