import 'dart:typed_data';
import 'package:latlong2/latlong.dart';
import 'player.dart';

class MeshPacket {
  final String playerId;
  final double latitude;
  final double longitude;
  final int teamIndex;
  final int statusIndex;
  final DateTime timestamp;

  MeshPacket({
    required this.playerId,
    required this.latitude,
    required this.longitude,
    required this.teamIndex,
    this.statusIndex = 0,
    required this.timestamp,
  });

  LatLng get position => LatLng(latitude, longitude);
  Team get team => Team.values[teamIndex];

  factory MeshPacket.fromBytes(Uint8List bytes) {
    if (bytes.length < 11) throw Exception('Invalid packet length');
    
    final buffer = ByteData.sublistView(bytes);
    final playerIdHash = buffer.getUint16(0);
    final latRaw = buffer.getUint16(2);
    final lngRaw = buffer.getUint16(4);
    final teamIndex = buffer.getUint8(6);
    final statusIndex = buffer.getUint8(7);
    
    return MeshPacket(
      playerId: playerIdHash.toString(),
      latitude: latRaw / 364.0 - 90,
      longitude: lngRaw / 182.0 - 180,
      teamIndex: teamIndex,
      statusIndex: statusIndex,
      timestamp: DateTime.now(),
    );
  }

  Uint8List toBytes() {
    final buffer = ByteData(11);
    buffer.setUint16(0, playerId.hashCode & 0xFFFF);
    buffer.setUint16(2, ((latitude + 90) * 364.0).toInt() & 0xFFFF);
    buffer.setUint16(4, ((longitude + 180) * 182.0).toInt() & 0xFFFF);
    buffer.setUint8(6, teamIndex);
    buffer.setUint8(7, statusIndex);
    buffer.setUint32(8, 0);
    return buffer.buffer.asUint8List();
  }
}
