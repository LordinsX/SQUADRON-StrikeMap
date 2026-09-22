import 'package:latlong2/latlong.dart';
import 'package:flutter/material.dart';

enum PoiType { flag, medic, base, spawn, killzone, danger, custom }
enum PoiVisibility { public, team, private }

class Poi {
  final String id;
  final String name;
  final PoiType type;
  final LatLng position;
  final double captureRadius;
  final PoiVisibility visibility;
  final String? team;
  final String? owner;
  final int points;

  Poi({
    required this.id,
    required this.name,
    required this.type,
    required this.position,
    this.captureRadius = 15.0,
    this.visibility = PoiVisibility.public,
    this.team,
    this.owner,
    this.points = 10,
  });

  factory Poi.fromJson(Map<String, dynamic> json) {
    return Poi(
      id: json['id'],
      name: json['name'],
      type: PoiType.values[json['type']],
      position: LatLng(json['lat'], json['lng']),
      captureRadius: (json['captureRadius'] ?? 15.0).toDouble(),
      visibility: PoiVisibility.values[json['visibility'] ?? 0],
      team: json['team'],
      owner: json['owner'],
      points: json['points'] ?? 10,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type.index,
      'lat': position.latitude,
      'lng': position.longitude,
      'captureRadius': captureRadius,
      'visibility': visibility.index,
      'team': team,
      'owner': owner,
      'points': points,
    };
  }

  IconData get iconData {
    switch (type) {
      case PoiType.flag: return Icons.flag;
      case PoiType.medic: return Icons.local_hospital;
      case PoiType.base: return Icons.home;
      case PoiType.spawn: return Icons.flag_circle;
      case PoiType.killzone: return Icons.warning;
      case PoiType.danger: return Icons.dangerous;
      case PoiType.custom: return Icons.location_on;
    }
  }

  Color get color {
    switch (type) {
      case PoiType.flag: return Colors.amber;
      case PoiType.medic: return Colors.red;
      case PoiType.base: return Colors.green;
      case PoiType.spawn: return Colors.lightGreen;
      case PoiType.killzone: return Colors.black;
      case PoiType.danger: return Colors.orange;
      case PoiType.custom: return Colors.grey;
    }
  }
}
