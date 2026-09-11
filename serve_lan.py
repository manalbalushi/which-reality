"""Serve the tracker to the rest of the office network.

Unlike run.py (single-user, localhost only, Flask's debug server), this
binds to every network interface on a production-grade WSGI server so
colleagues on the same office network/Wi-Fi can reach it from their own
browser - no debugger, no auto-reload, no single-user assumption.

Usage:
    python3 serve_lan.py            # port 5000
    PORT=8080 python3 serve_lan.py  # a different port
"""
import os
import socket

from waitress import serve

from action_tracker import create_app

PORT = int(os.environ.get("PORT", "5000"))


def local_ip_addresses():
    """Best-effort list of this machine's LAN IPv4 addresses."""
    addrs = set()
    hostname = socket.gethostname()
    try:
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET):
            ip = info[4][0]
            if not ip.startswith("127."):
                addrs.add(ip)
    except socket.gaierror:
        pass
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        addrs.add(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    return sorted(addrs) or ["<this machine's LAN IP>"]


if __name__ == "__main__":
    app = create_app()
    print("=" * 64)
    print("Action & Evidence Tracker - serving to the office network")
    print("=" * 64)
    print(f"On this PC:        http://127.0.0.1:{PORT}")
    for ip in local_ip_addresses():
        print(f"For colleagues:    http://{ip}:{PORT}")
    print()
    print("Share one of the 'For colleagues' addresses above - only reachable")
    print("from the same office network/VPN. Keep this window open; closing it")
    print("stops the app for everyone. Press Ctrl+C to stop.")
    print("=" * 64)
    serve(app, host="0.0.0.0", port=PORT, threads=8)
