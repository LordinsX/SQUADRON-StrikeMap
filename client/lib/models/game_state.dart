import 'package:latlong2/latlong.dart';
import 'player.dart';
import 'poi.dart';

enum MatchStatus { idle, running, paused, finished }

class GameState {
  final String? myId;
  final Player? me;
  final Map<String, Player> players;
  final Map<String, Poi> pois;
  final Map<String, int> scores;
  final MatchStatus matchStatus;
  final int matchTimer;
  final LatLng? myPosition;
  final double myHeading;

  GameState({
    this.myId,
    this.me,
    this.players = const {},
    this.pois = const {},
    this.scores = const {'red': 0, 'blue': 0},
    this.matchStatus = MatchStatus.idle,
    this.matchTimer = 0,
    this.myPosition,
    this.myHeading = 0.0,
  });

  GameState copyWith({
    String? myId,
    Player? me,
    Map<String, Player>? players,
    Map<String, Poi>? pois,
    Map<String, int>? scores,
    MatchStatus? matchStatus,
    int? matchTimer,
    LatLng? myPosition,
    double? myHeading,
  }) {
    return GameState(
      myId: myId ?? this.myId,
      me: me ?? this.me,
      players: players ?? this.players,
      pois: pois ?? this.pois,
      scores: scores ?? this.scores,
      matchStatus: matchStatus ?? this.matchStatus,
      matchTimer: matchTimer ?? this.matchTimer,
      myPosition: myPosition ?? this.myPosition,
      myHeading: myHeading ?? this.myHeading,
    );
  }
}
