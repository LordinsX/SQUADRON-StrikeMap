import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class TacticalMap extends StatelessWidget {
  final LatLng? myPosition;
  final List<dynamic> players;
  final List<dynamic> pois;

  const TacticalMap({
    super.key,
    this.myPosition,
    this.players = const [],
    this.pois = const [],
  });

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: MapOptions(
        initialCenter: myPosition ?? const LatLng(55.7558, 37.6173),
        initialZoom: 16.0,
        minZoom: 12.0,
        maxZoom: 19.0,
        backgroundColor: const Color(0xFF1a1a1a),
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.squadron.tactical',
        ),
        
        MarkerLayer(
          markers: [
            if (myPosition != null)
              Marker(
                point: myPosition!,
                width: 32,
                height: 32,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
