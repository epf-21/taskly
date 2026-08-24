import { calculatePosition } from 'src/shared/utils/fractional-index.util';

describe('fractional-index.util', () => {
  describe('calculatePosition', () => {
    it('usa la posición base cuando no hay vecinos (primera columna)', () => {
      expect(calculatePosition()).toBe(1024);
      expect(calculatePosition(null, null)).toBe(1024);
    });

    it('calcula el punto medio entre dos vecinos', () => {
      expect(calculatePosition(1, 2)).toBe(1.5);
      expect(calculatePosition(10, 20)).toBe(15);
      expect(calculatePosition(1024, 2048)).toBe(1536);
    });

    it('extiende hacia abajo al insertar al inicio (solo after)', () => {
      expect(calculatePosition(null, 1024)).toBe(1023);
      expect(calculatePosition(null, 5)).toBe(4);
    });

    it('extiende hacia arriba al insertar al final (solo before)', () => {
      expect(calculatePosition(1024, null)).toBe(1025);
      expect(calculatePosition(7, null)).toBe(8);
    });

    it('soporta inserciones sucesivas en el medio sin colisión inmediata', () => {
      let previous = 0;
      const next = 1;
      const positions: number[] = [];

      for (let i = 0; i < 10; i++) {
        const position = calculatePosition(previous, next);
        positions.push(position);
        previous = position;
      }

      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThan(positions[i - 1]);
      }
      positions.forEach((position) => expect(position).toBeLessThan(1));
    });
  });
});
