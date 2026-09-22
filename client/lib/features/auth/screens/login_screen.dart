import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _callsignController = TextEditingController();
  int _selectedTeam = 0;
  int _selectedRole = 0;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1a1a1a),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'SQUADRON',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'StrikeMap',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 48),
                
                TextField(
                  controller: _callsignController,
                  style: const TextStyle(fontSize: 20, color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Позывной',
                    labelStyle: const TextStyle(color: Colors.grey),
                    filled: true,
                    fillColor: const Color(0xFF2a2a2a),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                
                const Text('Команда', style: TextStyle(color: Colors.white, fontSize: 16)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => setState(() => _selectedTeam = 0),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _selectedTeam == 0 
                              ? const Color(0xFFE53935) 
                              : const Color(0xFF2a2a2a),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: const Text('КРАСНЫЕ', 
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => setState(() => _selectedTeam = 1),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _selectedTeam == 1 
                              ? const Color(0xFF1E88E5) 
                              : const Color(0xFF2a2a2a),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: const Text('СИНИЕ', 
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                
                const Text('Роль', style: TextStyle(color: Colors.white, fontSize: 16)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => setState(() => _selectedRole = 0),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _selectedRole == 0 
                              ? Colors.orange 
                              : const Color(0xFF2a2a2a),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: const Text('СОЛДАТ', 
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => setState(() => _selectedRole = 1),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _selectedRole == 1 
                              ? Colors.purple 
                              : const Color(0xFF2a2a2a),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: const Text('КОМАНДИР', 
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 48),
                
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D47A1),
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'ВОЙТИ В БОЙ',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    if (_callsignController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Введите позывной')),
      );
      return;
    }

    setState(() => _isLoading = true);
    
    // TODO: Реализовать логику входа
    await Future.delayed(const Duration(seconds: 2));
    
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _callsignController.dispose();
    super.dispose();
  }
}
