import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../config.dart';

class GpsManager {
  StreamSubscription<Position>? _positionSub;
  final StreamController<GeoUpdate> _updateCtrl = StreamController.broadcast();
  
  Stream<GeoUpdate> get updates => _updateCtrl.stream;
  
  LatLng? _lastValidPosition;
  DateTime? _lastUpdate;
  final Distance _distance = const Distance();

  Future<void> start() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      await Geolocator.requestPermission();
    }
    
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 0,
      timeLimit: GpsConfig.updateInterval,
    );
    
    _positionSub = Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen(_handlePosition);
  }

  void _handlePosition(Position pos) {
    if (pos.accuracy > GpsConfig.geoMaxAccuracy) return;
    
    final current = LatLng(pos.latitude, pos.longitude);
    
    if (_lastValidPosition != null) {
      final dist = _distance.as(LengthUnit.Meter, _lastValidPosition!, current);
      if (dist < GpsConfig.geoMinMoveMeters) return;
    }
    
    final now = DateTime.now();
    if (_lastUpdate != null && now.difference(_lastUpdate!) < GpsConfig.updateInterval) {
      return;
    }
    
    _lastValidPosition = current;
    _lastUpdate = now;
    
    _updateCtrl.add(GeoUpdate(
      position: current,
      accuracy: pos.accuracy,
      speed: pos.speed,
      heading: pos.heading,
      timestamp: now,
    ));
  }

  void stop() => _positionSub?.cancel();
  
  void dispose() {
    stop();
    _updateCtrl.close();
  }
}

class GeoUpdate {
  final LatLng position;
  final double accuracy;
  final double speed;
  final double heading;
  final DateTime timestamp;
  
  GeoUpdate({
    required this.position,
    required this.accuracy,
    required this.speed,
    required this.heading,
    required this.timestamp,
  });
}
