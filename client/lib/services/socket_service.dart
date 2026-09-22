import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config.dart';

class SocketService {
  IO.Socket? _socket;
  bool _isConnected = false;
  
  bool get isConnected => _isConnected;
  
  final StreamController<Map<String, dynamic>> _eventsCtrl = 
      StreamController.broadcast();
  Stream<Map<String, dynamic>> get events => _eventsCtrl.stream;

  Future<void> connect() async {
    _socket = IO.io(AppConfig.socketUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
      'reconnection': true,
      'reconnectionAttempts': 10,
      'reconnectionDelay': 1000,
    });

    _socket!.onConnect((_) {
      _isConnected = true;
      print('Socket connected');
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      print('Socket disconnected');
    });

    _socket!.on('game:state', (data) {
      _eventsCtrl.add({'event': 'game:state', 'data': data});
    });

    _socket!.on('players:update', (data) {
      _eventsCtrl.add({'event': 'players:update', 'data': data});
    });

    _socket!.on('pois:update', (data) {
      _eventsCtrl.add({'event': 'pois:update', 'data': data});
    });

    _socket!.on('scores:update', (data) {
      _eventsCtrl.add({'event': 'scores:update', 'data': data});
    });

    _socket!.on('match:status', (data) {
      _eventsCtrl.add({'event': 'match:status', 'data': data});
    });

    _socket!.on('match:timer', (data) {
      _eventsCtrl.add({'event': 'match:timer', 'data': data});
    });
  }

  Future<void> joinGame(Map<String, dynamic> data) async {
    if (_socket == null || !_isConnected) {
      throw Exception('Socket not connected');
    }
    
    final completer = Completer<Map<String, dynamic>>();
    
    _socket!.emitWithAck('player:join', data).then((response) {
      completer.complete(response);
    });
    
    return completer.future;
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }

  void dispose() {
    disconnect();
    _eventsCtrl.close();
  }
}
