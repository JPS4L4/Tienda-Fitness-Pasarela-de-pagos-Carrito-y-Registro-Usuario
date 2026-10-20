'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BRAND_LABEL,
  TEST_CARDS,
  detectBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  type CardInput,
} from '@/lib/payments/card';
import { cn } from '@/lib/utils';

export const EMPTY_CARD: CardInput = { number: '', holder: '', expiry: '', cvc: '' };

/** Tarjeta de prueba aprobada con datos completos (botón "Usar tarjeta de prueba"). */
export const SAMPLE_CARD: CardInput = {
  number: '4242 4242 4242 4242',
  holder: 'CLIENTE DEMO',
  expiry: '12/40',
  cvc: '123',
};

interface DemoCardFormProps {
  card: CardInput;
  onChange: (card: CardInput) => void;
  /** Campo con error de validación (se marca en rojo) */
  invalidField?: keyof CardInput | null;
  disabled?: boolean;
}

function CardPreview({ card, flipped }: { card: CardInput; flipped: boolean }) {
  const reduce = useReducedMotion();
  const brand = detectBrand(card.number);
  const digits = digitsOnly(card.number);
  const total = brand === 'amex' ? 15 : 16;
  const slots = Array.from({ length: total }, (_, i) => digits[i] ?? '•').join('');
  const masked =
    brand === 'amex'
      ? `${slots.slice(0, 4)} ${slots.slice(4, 10)} ${slots.slice(10)}`
      : (slots.match(/.{4}/g) ?? []).join(' ');

  const face = 'absolute inset-0 flex flex-col justify-between border-2 border-line-strong bg-surface-3 p-5 [backface-visibility:hidden]';

  return (
    <div className="[perspective:1000px]" aria-hidden="true">
      <motion.div
        className="relative mx-auto h-48 w-full max-w-sm shadow-[6px_6px_0_0_var(--color-accent)] [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.2, 0, 0, 1] }}
      >
        <div className={face}>
          <span className="absolute inset-x-0 top-0 h-1.5 bg-accent" />
          <div className="mt-1 flex items-start justify-between">
            <span className="h-8 w-11 border-2 border-accent/70 bg-accent/20" />
            <span className="font-display text-2xl uppercase leading-none text-fg">
              {brand === 'unknown' ? 'Demo' : BRAND_LABEL[brand]}
            </span>
          </div>
          <p className="font-mono text-lg tracking-widest text-fg sm:text-xl">{masked}</p>
          <div className="flex items-end justify-between gap-4 text-xs uppercase tracking-widest text-muted">
            <span className="min-w-0">
              Titular
              <span className="block truncate text-sm text-fg">{card.holder || 'Nombre Apellido'}</span>
            </span>
            <span className="shrink-0">
              Vence
              <span className="block text-sm text-fg">{card.expiry || 'MM/AA'}</span>
            </span>
          </div>
        </div>

        <div className={cn(face, 'justify-start gap-6 px-0 [transform:rotateY(180deg)]')}>
          <span className="mt-2 block h-10 bg-black" />
          <div className="px-5">
            <p className="mb-1 text-right text-xs uppercase tracking-widest text-muted">CVC</p>
            <p className="bg-fg px-3 py-2 text-right font-mono text-lg tracking-widest text-bg">
              {card.cvc ? card.cvc.replace(/\d/g, '•') : '•••'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DemoCardForm({ card, onChange, invalidField, disabled }: DemoCardFormProps) {
  const [cvcFocused, setCvcFocused] = useState(false);
  const brand = detectBrand(card.number);

  const set = (patch: Partial<CardInput>) => onChange({ ...card, ...patch });
  const invalid = (field: keyof CardInput) => (invalidField === field ? true : undefined);

  return (
    <div className="space-y-6 border-2 border-line-strong bg-surface-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="badge badge-warn">Pago simulado</span>
        <button
          type="button"
          onClick={() => onChange(SAMPLE_CARD)}
          disabled={disabled}
          className="btn btn-secondary btn-sm"
        >
          Usar tarjeta de prueba
        </button>
      </div>

      <CardPreview card={card} flipped={cvcFocused} />

      <div className="space-y-5">
        <div>
          <label htmlFor="cardNumber" className="label">
            Número de tarjeta
          </label>
          <input
            id="cardNumber"
            name="cc-number"
            inputMode="numeric"
            autoComplete="cc-number"
            className="input font-mono tracking-wider"
            placeholder="4242 4242 4242 4242"
            value={card.number}
            onChange={(e) => set({ number: formatCardNumber(e.target.value) })}
            aria-invalid={invalid('number')}
            disabled={disabled}
          />
        </div>

        <div>
          <label htmlFor="cardHolder" className="label">
            Titular
          </label>
          <input
            id="cardHolder"
            name="cc-name"
            autoComplete="cc-name"
            className="input uppercase"
            placeholder="Como aparece en la tarjeta"
            maxLength={60}
            value={card.holder}
            onChange={(e) => set({ holder: e.target.value })}
            aria-invalid={invalid('holder')}
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label htmlFor="cardExpiry" className="label">
              Vencimiento
            </label>
            <input
              id="cardExpiry"
              name="cc-exp"
              inputMode="numeric"
              autoComplete="cc-exp"
              className="input font-mono"
              placeholder="MM/AA"
              value={card.expiry}
              onChange={(e) => set({ expiry: formatExpiry(e.target.value) })}
              aria-invalid={invalid('expiry')}
              disabled={disabled}
            />
          </div>
          <div>
            <label htmlFor="cardCvc" className="label">
              CVC
            </label>
            <input
              id="cardCvc"
              name="cc-csc"
              inputMode="numeric"
              autoComplete="cc-csc"
              className="input font-mono"
              placeholder={brand === 'amex' ? '1234' : '123'}
              value={card.cvc}
              onChange={(e) => set({ cvc: digitsOnly(e.target.value).slice(0, 4) })}
              onFocus={() => setCvcFocused(true)}
              onBlur={() => setCvcFocused(false)}
              aria-invalid={invalid('cvc')}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <p className="eyebrow mb-3">Tarjetas de prueba</p>
        <ul className="space-y-2">
          {TEST_CARDS.map((test) => (
            <li key={test.number} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                <code className="font-mono text-fg">{test.number}</code>
                <span className={cn('ml-2', test.approved ? 'text-ok' : 'text-danger')}>{test.label}</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange({
                    number: test.number,
                    holder: card.holder || SAMPLE_CARD.holder,
                    expiry: card.expiry || SAMPLE_CARD.expiry,
                    cvc: card.cvc || SAMPLE_CARD.cvc,
                  })
                }
                className="text-xs font-bold uppercase tracking-wider text-accent hover:text-accent-hover"
              >
                Usar
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Cualquier otra tarjeta con número válido también se aprueba. Nada de esto se guarda ni se envía a un banco.
        </p>
      </div>
    </div>
  );
}
