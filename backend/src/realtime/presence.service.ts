interface PresenceEntry { sockets: Set<string>; lastSeen: Date; }

class PresenceServiceImpl {
  private store = new Map<number, PresenceEntry>();

  addConnection(userId: number, socketId: string): void {
    const entry = this.store.get(userId) ?? { sockets: new Set(), lastSeen: new Date() };
    entry.sockets.add(socketId);
    entry.lastSeen = new Date();
    this.store.set(userId, entry);
  }

  removeConnection(userId: number, socketId: string): void {
    const entry = this.store.get(userId);
    if (!entry) return;
    entry.sockets.delete(socketId);
    entry.lastSeen = new Date();
    if (entry.sockets.size === 0) this.store.set(userId, entry);
  }

  isOnline(userId: number): boolean {
    return (this.store.get(userId)?.sockets.size ?? 0) > 0;
  }

  getOnlineUsers(): number[] {
    return [...this.store.entries()].filter(([, e]) => e.sockets.size > 0).map(([id]) => id);
  }

  stats(): { totalUsers: number; onlineUsers: number; totalConnections: number } {
    let totalConnections = 0;
    let onlineUsers = 0;
    for (const e of this.store.values()) {
      totalConnections += e.sockets.size;
      if (e.sockets.size > 0) onlineUsers++;
    }
    return { totalUsers: this.store.size, onlineUsers, totalConnections };
  }
}

export const presenceService = new PresenceServiceImpl();
