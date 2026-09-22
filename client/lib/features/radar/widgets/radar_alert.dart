import 'package:flutter/material.dart';

enum EnemyDirection { front, right, rear, left }

class RadarAlert extends StatelessWidget {
  final EnemyDirection direction;
  final double distance;

  const RadarAlert({
    super.key,
    required this.direction,
    required this.distance,
  });

  String get directionLabel {
    switch (direction) {
      case EnemyDirection.front: return "СПЕРЕДИ";
      case EnemyDirection.right: return "СПРАВА";
      case EnemyDirection.rear: return "СЗАДИ";
      case EnemyDirection.left: return "СЛЕВА";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white, width: 2),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.warning, color: Colors.white, size: 48),
          const SizedBox(height: 8),
          Text(
            directionLabel,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${distance.toStringAsFixed(0)} м',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 24,
            ),
          ),
        ],
      ),
    );
  }
}
