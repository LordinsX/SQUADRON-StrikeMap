import 'dart:convert';

class OfflineEvent {
  final String id;
  final String type;
  final Map<String, dynamic> payload;
  final DateTime timestamp;
  final int retryCount;

  OfflineEvent({
    required this.id,
    required this.type,
    required this.payload,
    required this.timestamp,
    this.retryCount = 0,
  });

  factory OfflineEvent.fromJson(Map<String, dynamic> json) {
    return OfflineEvent(
      id: json['id'],
      type: json['type'],
      payload: json['payload'],
      timestamp: DateTime.parse(json['timestamp']),
      retryCount: json['retryCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'payload': payload,
      'timestamp': timestamp.toIso8601String(),
      'retryCount': retryCount,
    };
  }

  List<List<int>> toChunks(int chunkSize) {
    final jsonStr = jsonEncode(toJson());
    final bytes = utf8.encode(jsonStr);
    final chunks = <List<int>>[];
    
    for (int i = 0; i < bytes.length; i += chunkSize) {
      final end = (i + chunkSize < bytes.length) ? i + chunkSize : bytes.length;
      chunks.add(bytes.sublist(i, end));
    }
    
    return chunks;
  }

  OfflineEvent incrementRetry() {
    return OfflineEvent(
      id: id,
      type: type,
      payload: payload,
      timestamp: timestamp,
      retryCount: retryCount + 1,
    );
  }
}
