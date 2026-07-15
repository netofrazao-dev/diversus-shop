/**
 * HoneypotField — campo "armadilha" invisível pra gente de verdade,
 * mas que bots preenchem automaticamente (eles preenchem TODOS os
 * campos de um formulário, sem saber que esse aqui é uma pegadinha).
 *
 * Como usar:
 *  1. Renderize <HoneypotField value={honeypot} onChange={setHoneypot} />
 *     dentro do <form>.
 *  2. No onSubmit, antes de salvar qualquer coisa, verifique:
 *     if (honeypot) return; // é bot, aborta silenciosamente
 *
 * Importante: NÃO usa display:none/visibility:hidden (bots mais
 * espertos ignoram campos assim). Em vez disso, posiciona fora da
 * tela com CSS, o que engana até bots que leem o DOM renderizado.
 */
export default function HoneypotField({ value, onChange }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      <label htmlFor="website">Não preencha este campo</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
