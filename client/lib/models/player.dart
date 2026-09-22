import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

enum Team { red, blue, spectator }
enum Role { soldier, commander, gamemaster }
enum PlayerStatus { active, dead, sos, respawning }

class Player {
  final String id;
  final String callsign;
  final Team team;
  final Role role;
  final String? squadId;
  final LatLng? position;
  final PlayerStatus status;
  final double speed;
  final double heading;
  final DateTime lastSeen;

  Player({
    required this.id,
    required this.callsign,
    required this.team,
    required this.role,
    this.squadId,
    this.position,
    this.status = PlayerStatus.active,
    this.speed = 0.0,
    this.heading = 0.0,
    required this.lastSeen,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json['id'],
      callsign: json['callsign'],
      team: Team.values[json['team']],
      role: Role.values[json['role']],
      squadId: json['squadId'],
      position: json['position'] != null
          ? LatLng(json['position']['lat'], json['position']['lng'])
          : null,
      status: PlayerStatus.values[json['status'] ?? 0],
      speed: (json['speed'] ?? 0).toDouble(),
      heading: (json['heading'] ?? 0).toDouble(),
      lastSeen: DateTime.fromMillisecondsSinceEpoch(json['lastSeen']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'callsign': callsign,
      'team': team.index,
      'role': role.index,
      'squadId': squadId,
      'position': position != null
          ? {'lat': position!.latitude, 'lng': position!.longitude}
          : null,
      'status': status.index,
      'speed': speed,
      'heading': heading,
      'lastSeen': lastSeen.millisecondsSinceEpoch,
    };
  }

  Color get teamColor {
    switch (team) {
      case Team.red: return const Color(0xFFE53935);
      case Team.blue: return const Color(0xFF1E88E5);
      case Team.spectator: return const Color(0xFF9E9E9E);
    }
  }

  Player copyWith({
    LatLng? position,
    PlayerStatus? status,
    double? speed,
    double? heading,
    DateTime? lastSeen,
  }) {
    return Player(
      id: id,
      callsign: callsign,
      team: team,
      role: role,
      squadId: squadId,
      position: position ?? this.position,
      status: status ?? this.status,
      speed: speed ?? this.speed,
      heading: heading ?? this.heading,
      lastSeen: lastSeen ?? this.lastSeen,
    );
  }
}
