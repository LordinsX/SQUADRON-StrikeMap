import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/game_state.dart';
import '../models/player.dart';
import '../services/socket_service.dart';
import '../services/gps_manager.dart';

final socketServiceProvider = Provider<SocketService>((ref) {
  return SocketService();
});

final gpsManagerProvider = Provider<GpsManager>((ref) {
  return GpsManager();
});

final gameStateProvider = StateNotifierProvider<GameStateNotifier, GameState>((ref) {
  return GameStateNotifier(ref);
});

class GameStateNotifier extends StateNotifier<GameState> {
  final Ref _ref;

  GameStateNotifier(this._ref) : super(GameState()) {
    _initSocket();
  }

  Future<void> _initSocket() async {
    final socket = _ref.read(socketServiceProvider);
    
    socket.events.listen((event) {
      final eventName = event['event'] as String;
      final data = event['data'];
      
      switch (eventName) {
        case 'game:state':
          _handleGameState(data);
          break;
        case 'players:update':
          _handlePlayersUpdate(data);
          break;
        case 'scores:update':
          _handleScoresUpdate(data);
          break;
        case 'match:status':
          _handleMatchStatus(data);
          break;
        case 'match:timer':
          _handleMatchTimer(data);
          break;
      }
    });
    
    await socket.connect();
  }

  void _handleGameState(dynamic data) {
    // Обработка полного состояния игры
  }

  void _handlePlayersUpdate(dynamic data) {
    // Обработка обновления игроков
  }

  void _handleScoresUpdate(dynamic data) {
    // Обработка обновления счета
  }

  void _handleMatchStatus(dynamic data) {
    // Обработка статуса матча
  }

  void _handleMatchTimer(dynamic data) {
    // Обработка таймера
  }

  Future<void> joinGame(String callsign, Team team, Role role, String? squadId) async {
    final socket = _ref.read(socketServiceProvider);
    
    final result = await socket.joinGame({
      'callsign': callsign,
      'team': team.index,
      'role': role.index,
      'squadId': squadId,
    });
    
    if (result['success'] == true) {
      state = state.copyWith(myId: result['playerId']);
    }
  }

  @override
  void dispose() {
    super.dispose();
  }
}
