import 'dart:async';
import 'dart:typed_data';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:hive/hive.dart';
import 'package:latlong2/latlong.dart';
import '../config.dart';
import '../models/mesh_packet.dart';
import '../models/offline_event.dart';
import '../models/player.dart';

class BleMeshService {
  late final String _myId;
  late final Team _myTeam;
  
  late final Box<OfflineEvent> _eventQueue;
  
  final StreamController<Map<String, MeshPacket>> _positionsCtrl = 
      StreamController.broadcast();
  Stream<Map<String, MeshPacket>> get positionsStream => _positionsCtrl.stream;
  
  final Map<String, MeshPacket> _peerPositions = {};
  Team get currentTeam => _myTeam;

  Future<void> initialize(String playerId, Team team) async {
    _myId = playerId;
    _myTeam = team;
    _eventQueue = Hive.box<OfflineEvent>('offline_events');
    
    if (await FlutterBluePlus.isSupported == false) {
      throw Exception("Bluetooth not supported");
    }
    
    await FlutterBluePlus.turnOn();
    await _startAdvertising();
    await _startScanning();
  }

  Future<void> _startAdvertising() async {
    final advData = AdvertiseData(
      serviceUuids: [Guid(BleConfig.squadronUuid)],
      includeDeviceName: false,
      manufacturerData: _buildPositionPayload(0, 0),
    );
    
    await FlutterBluePlus.startAdvertising(
      advData,
      duration: 0,
      interval: BleConfig.advertisingInterval,
    );
  }

  void updateAdvertisingPosition(LatLng pos, Team team) {
    // Обновление позиции в advertising данных
  }

  Uint8List _buildPositionPayload(double lat, double lng) {
    final buffer = ByteData(11);
    buffer.setUint16(0, _myId.hashCode & 0xFFFF);
    buffer.setUint16(2, ((lat + 90) * 364.0).toInt() & 0xFFFF);
    buffer.setUint16(4, ((lng + 180) * 182.0).toInt() & 0xFFFF);
    buffer.setUint8(6, _myTeam.index);
    buffer.setUint8(7, 0);
    buffer.setUint32(8, 0);
    return buffer.buffer.asUint8List();
  }

  Future<void> _startScanning() async {
    FlutterBluePlus.scanResults.listen((results) {
      for (final r in results) {
        _processScanResult(r);
      }
    });
    
    await FlutterBluePlus.startScan(
      withServices: [Guid(BleConfig.squadronUuid)],
      continuousUpdates: true,
      continuousMode: AndroidContinuousScanMode.lowLatency,
    );
  }

  void _processScanResult(ScanResult result) {
    final mfgData = result.advertisementData.manufacturerData;
    if (mfgData.isEmpty) return;
    
    for (final entry in mfgData.entries) {
      final bytes = Uint8List.fromList(entry.value);
      if (bytes.length < 11) continue;
      
      try {
        final packet = MeshPacket.fromBytes(bytes);
        _peerPositions[packet.playerId] = packet;
        _positionsCtrl.add(Map.from(_peerPositions));
      } catch (e) {
        // Игнорируем невалидные пакеты
      }
    }
  }

  Future<void> queueEvent(OfflineEvent event) async {
    await _eventQueue.add(event);
  }

  void dispose() {
    FlutterBluePlus.stopScan();
    FlutterBluePlus.stopAdvertising();
    _positionsCtrl.close();
  }
}
