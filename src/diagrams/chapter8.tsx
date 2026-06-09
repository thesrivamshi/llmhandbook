// Chapter 8 — Inference Optimization (pp. 318–343). Generation optimizations
// (KV cache, continuous batching, speculative decoding, optimized attention),
// model parallelism (data/pipeline/tensor), and quantization (FP formats, INT8,
// GGUF/llama.cpp, GPTQ/EXL2, AWQ). Stage = Inference (coral) — first coral chapter.
// Figures 8.1–8.11 redrawn. pp.344–345 are References, skipped.
import React from "react";
import {
  Canvas,
  ModelGlyph,
  DataStoreGlyph,
  VectorDBGlyph,
  PipelineGlyph,
  DocumentGlyph,
  UserGlyph,
  DecisionGlyph,
  SnapshotGlyph,
} from "../shapes";
import { Arrow, Label, BrandNode, Pill, LabelBox, Boundary, Warn } from "./parts";
import { STAGES } from "../theme";
import type { PageDiagram } from "./types";

const I = STAGES.inference.accent; // coral
const MONO = "'IBM Plex Mono', monospace";

const Frame: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <Canvas width={w} height={h}>{children}</Canvas>
);

const Code: React.FC<{ x: number; y: number; w: number; lines: { t: string; hi?: boolean }[]; size?: number }> = ({
  x, y, w, lines, size = 12,
}) => {
  const lh = size + 7;
  const h = lines.length * lh + 18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="#FFFFFF" stroke="#ECE8DF" strokeWidth={1.5} />
      {lines.map((l, i) => (
        <text key={i} x={x + 14} y={y + 16 + i * lh} fontFamily={MONO} fontSize={size} fill={l.hi ? I : "#25313C"} fontWeight={l.hi ? 700 : 500}>
          {l.t}
        </text>
      ))}
    </g>
  );
};

// A small GPU box for parallelism diagrams.
const GPU: React.FC<{ x: number; y: number; w?: number; h?: number; label: string; fill?: number }> = ({ x, y, w = 90, h = 70, label, fill = 0.12 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={`${I}${Math.round(fill * 255).toString(16).padStart(2, "0")}`} stroke={I} strokeWidth={1.6} />
    <Label x={x + w / 2} y={y + h / 2} size={11} weight={600} color="#25313C">{label}</Label>
  </g>
);

export const CHAPTER8: PageDiagram[] = [
  /* p318 */
  {
    page: 318, chapter: 8, stage: "inference", accent: I, archetype: "single-concept",
    section: "Chapter 8: Inference Optimization",
    term: "INFERENCE GOALS", title: "Cut latency, raise throughput, shrink memory",
    caption:
      "Deploying LLMs is expensive. Inference optimization targets three goals — lower latency (time to first token), higher throughput (tokens/sec), and smaller memory footprint — for 2–4× speedups across engines like TGI, vLLM, TensorRT-LLM.",
    diagram: (
      <Frame w={720} h={210}>
        <ModelGlyph x={290} y={70} w={130} h={110} accent={I} />
        {["↓ latency", "↑ throughput", "↓ memory"].map((t, i) => {
          const pos = [[40, 50], [490, 50], [260, 160]][i];
          return (
            <g key={t}>
              <Pill x={pos[0]} y={pos[1]} text={t} accent={I} w={190} />
              <line x1={355} y1={125} x2={pos[0] + 95} y2={pos[1] + 15} stroke="#ECE8DF" strokeWidth={1.4} />
            </g>
          );
        })}
      </Frame>
    ),
  },
  /* p319 — architectures */
  {
    page: 319, chapter: 8, stage: "inference", accent: I, archetype: "comparison",
    section: "Model optimization strategies",
    term: "ARCHITECTURES", title: "Decoder-only dominates LLMs",
    caption:
      "Three Transformer shapes: encoder-only (BERT — understanding, classification), encoder-decoder (T5 — sequence-to-sequence), and decoder-only (GPT, Llama — text generation). The book focuses on decoder-only.",
    diagram: (
      <Frame w={740} h={220}>
        {[
          ["encoder-only", "BERT · understand", false],
          ["encoder-decoder", "T5 · seq2seq", false],
          ["decoder-only", "GPT, Llama · generate", true],
        ].map(([t, sub, main], i) => (
          <g key={i}>
            <LabelBox x={20 + i * 245} y={60} w={210} h={70} text={t as string} sub={sub as string} accent={I} strong={main as boolean} />
            <ModelGlyph x={85 + i * 245} y={140} w={70} h={56} accent={I} />
          </g>
        ))}
      </Frame>
    ),
  },
  /* p320 — Fig 8.1 inference process */
  {
    page: 320, chapter: 8, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "KV cache",
    term: "INFERENCE", title: "Tokenize → attention → generate (Fig 8.1)",
    caption:
      "Decoder-only inference: tokenize + embed the prompt, compute key/value pairs via attention, then generate tokens one at a time. Steps 1–2 parallelize well; step 3 is inherently sequential — the core bottleneck.",
    diagram: (
      <Frame w={760} h={210}>
        {["tokenize + embed", "attention K/V", "generate token-by-token"].map((t, i) => (
          <g key={t}>
            <PipelineGlyph x={20 + i * 245} y={55} w={210} h={90} accent={I} />
            <Label x={125 + i * 245} y={100} weight={600} size={12}>{t}</Label>
            {i < 2 && <Arrow x1={230 + i * 245} y1={100} x2={265 + i * 245} y2={100} accent={I} animated={i === 0} />}
          </g>
        ))}
        <Warn x={520} y={170} text="step 3 is sequential — the bottleneck" />
      </Frame>
    ),
  },
  /* p321 — Fig 8.2 KV cache */
  {
    page: 321, chapter: 8, stage: "inference", accent: I, archetype: "single-concept",
    section: "KV cache",
    term: "KV CACHE", title: "Cache key/value pairs, reuse them (Fig 8.2)",
    caption:
      "Each new token would recompute keys/values for all previous tokens. The KV cache stores them, so only the new token’s K/V is computed and appended — a major speedup, though the cache exceeds 2 GB for a 7B model at long context.",
    diagram: (
      <Frame w={720} h={210}>
        <Boundary x={40} y={50} w={400} h={110} title="KV cache" accent={I} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={60 + i * 70} y={85} width={56} height={40} rx={8} fill={`${I}26`} stroke={I} strokeWidth={1.5} />
        ))}
        <rect x={340} y={85} width={56} height={40} rx={8} fill={`${I}66`} stroke={I} strokeWidth={2} />
        <Label x={368} y={105} size={11} weight={700}>new</Label>
        <Label x={240} y={185} size={11} color="#5E6B76">only the new token’s K/V is computed</Label>
        <ModelGlyph x={520} y={70} w={110} h={90} accent={I} />
        <Arrow x1={440} y1={105} x2={518} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p322 — static KV cache + torch.compile */
  {
    page: 322, chapter: 8, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "KV cache",
    term: "STATIC CACHE", title: "Static cache unlocks torch.compile",
    caption:
      "A dynamic KV cache blocks torch.compile. Pre-allocating a static cache (cache_implementation='static') lets you compile the model into fused kernels for up to a 4× faster forward pass.",
    diagram: (
      <Frame w={740} h={200}>
        <Code
          x={30}
          y={40}
          w={430}
          lines={[
            { t: 'config.cache_implementation = "static"', hi: true },
            { t: "compiled = torch.compile(model,", hi: true },
            { t: '  mode="reduce-overhead")', hi: false },
            { t: "# up to 4× faster forward pass", hi: false },
          ]}
        />
        <BrandNode x={500} y={75} name="PyTorch" sub="torch.compile" w={170} />
        <Pill x={500} y={135} text="4× forward" accent={I} w={150} />
      </Frame>
    ),
  },
  /* p323 — continuous batching */
  {
    page: 323, chapter: 8, stage: "inference", accent: I, archetype: "cycle",
    section: "Continuous batching",
    term: "CONTINUOUS BATCH", title: "Evict finished, feed the next",
    caption:
      "Traditional batching waits for the slowest request. Continuous (in-flight) batching evicts a request the moment it finishes and immediately admits a new one, keeping the accelerator at a full batch. Native in TGI, vLLM, TensorRT-LLM.",
    diagram: (
      <Frame w={720} h={220}>
        <Boundary x={250} y={50} w={220} h={120} title="batch (always full)" accent={I} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={270} y={70 + i * 32} width={180} height={24} rx={6} fill={`${I}26`} stroke={I} strokeWidth={1.4} />
        ))}
        <Pill x={20} y={95} text="new request" accent={I} w={150} />
        <Pill x={540} y={95} text="finished → out" accent={I} w={150} />
        <Arrow x1={172} y1={107} x2={248} y2={107} accent={I} />
        <Arrow x1={470} y1={107} x2={538} y2={107} accent={I} />
      </Frame>
    ),
  },
  /* p324 — Fig 8.3 speculative decoding */
  {
    page: 324, chapter: 8, stage: "inference", accent: I, archetype: "comparison",
    section: "Speculative decoding",
    term: "SPECULATIVE", title: "Small model drafts, large model verifies (Fig 8.3)",
    caption:
      "Speculative decoding uses spare compute: a small draft model proposes 5–10 tokens in one step; the large model verifies them in a single pass and keeps the longest matching prefix. A 90% match yields a 3–4× speedup.",
    diagram: (
      <Frame w={740} h={230}>
        <Label x={150} y={30} size={11} weight={700} color={I}>TRADITIONAL</Label>
        <ModelGlyph x={60} y={50} w={100} h={90} accent={I} />
        <Label x={110} y={155} size={11}>large model</Label>
        <Pill x={60} y={175} text="1 token / step" accent={I} w={150} />
        <Label x={530} y={30} size={11} weight={700} color={I}>SPECULATIVE</Label>
        <ModelGlyph x={400} y={60} w={70} h={60} accent={I} />
        <Label x={435} y={135} size={10.5}>draft (small)</Label>
        <ModelGlyph x={560} y={50} w={100} h={90} accent={I} />
        <Label x={610} y={155} size={11}>large verifies</Label>
        <Arrow x1={470} y1={90} x2={558} y2={95} accent={I} />
        <Pill x={400} y={170} text="5–10 tokens / step" accent={I} w={250} />
      </Frame>
    ),
  },
  /* p325 — speculative impl */
  {
    page: 325, chapter: 8, stage: "inference", accent: I, archetype: "code-anatomy",
    section: "Speculative decoding",
    term: "assistant_model", title: "Enable with one argument",
    caption:
      "In transformers, pass assistant_model to generate() to enable speculative decoding (both models must share a tokenizer). prompt_lookup_num_tokens enables prompt-lookup decoding for input-grounded tasks like summarization.",
    diagram: (
      <Frame w={740} h={190}>
        <Code
          x={30}
          y={40}
          w={450}
          lines={[
            { t: "model.generate(**inputs,", hi: false },
            { t: "  assistant_model=draft_model)", hi: true },
            { t: "# or: prompt_lookup_num_tokens=4", hi: true },
          ]}
        />
        <BrandNode x={510} y={50} name="Qwen" sub="1.8B + 0.5B draft" w={200} />
        <Warn x={520} y={130} text="same tokenizer required" />
      </Frame>
    ),
  },
  /* p326 — Medusa + PagedAttention */
  {
    page: 326, chapter: 8, stage: "inference", accent: I, archetype: "single-concept",
    section: "Optimized attention mechanisms",
    term: "MEDUSA · PAGED", title: "Speculation heads + paged KV cache",
    caption:
      "Medusa inserts speculation heads into the model (a 70M head can approximate a 7B model). PagedAttention partitions the KV cache into non-contiguous blocks (OS-style paging), cutting memory overhead ~55% and boosting throughput ~2.2× — first in vLLM.",
    diagram: (
      <Frame w={720} h={210}>
        <ModelGlyph x={40} y={70} w={110} h={100} accent={I} />
        <Label x={95} y={185} size={11}>main model</Label>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={170} y={70 + i * 36} width={70} height={28} rx={6} fill={`${I}26`} stroke={I} strokeWidth={1.4} />
        ))}
        <Label x={290} y={95} anchor="start" size={11} color="#5E6B76">Medusa heads</Label>
        <Boundary x={430} y={60} w={270} h={110} title="PagedAttention blocks" accent={I} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={450 + i * 60} y={95} width={48} height={40} rx={8} fill={`${I}26`} stroke={I} strokeWidth={1.4} />
        ))}
        <Arrow x1={150} y1={110} x2={168} y2={100} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p327 — FlashAttention-2 */
  {
    page: 327, chapter: 8, stage: "inference", accent: I, archetype: "single-concept",
    section: "Model parallelism",
    term: "FLASHATTENTION-2", title: "Block-wise attention in fast SRAM",
    caption:
      "FlashAttention-2 splits attention into blocks that fit the GPU’s on-chip SRAM and uses online softmax (running max/sum) — slashing slow memory transfers and reducing memory from quadratic to linear. Enable via attn_implementation='flash_attention_2'.",
    diagram: (
      <Frame w={740} h={200}>
        <Boundary x={40} y={50} w={300} h={110} title="attention matrix → blocks" accent={I} />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
          <rect key={`${r}-${c}`} x={70 + c * 80} y={75 + r * 26} width={70} height={20} rx={4} fill={`${I}22`} stroke={I} strokeWidth={1.2} />
        )))}
        <LabelBox x={420} y={75} w={150} h={56} text="on-chip SRAM" sub="fast" accent={I} strong />
        <Pill x={420} y={140} text="online softmax" accent={I} w={170} />
        <Arrow x1={340} y1={105} x2={418} y2={103} accent={I} />
      </Frame>
    ),
  },
  /* p328 — Fig 8.4 data parallelism */
  {
    page: 328, chapter: 8, stage: "inference", accent: I, archetype: "architecture",
    section: "Data parallelism",
    term: "DATA PARALLEL", title: "Replicate model, split data (Fig 8.4)",
    caption:
      "Data parallelism copies the whole model onto each GPU and splits the data across them — great for concurrent requests, but the model must fit on one GPU, so it’s mostly used for training.",
    diagram: (
      <Frame w={740} h={210}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <GPU x={30 + i * 180} y={60} w={150} h={80} label={`GPU ${i + 1}`} />
            <ModelGlyph x={70 + i * 180} y={70} w={60} h={50} accent={I} />
            <Pill x={50 + i * 180} y={155} text={`data ${i + 1}`} accent={I} w={110} />
          </g>
        ))}
        <Label x={370} y={30} size={11} color="#5E6B76">full model on every GPU</Label>
      </Frame>
    ),
  },
  /* p329 — Fig 8.5 pipeline parallelism */
  {
    page: 329, chapter: 8, stage: "inference", accent: I, archetype: "architecture",
    section: "Pipeline parallelism",
    term: "PIPELINE PARALLEL", title: "Split layers across GPUs (Fig 8.5)",
    caption:
      "Pipeline parallelism partitions the model’s layers across GPUs — GPU 1 runs the first 25%, GPU 2 the next, and so on, passing activations forward. It cuts per-GPU memory but introduces idle ‘pipeline bubbles’.",
    diagram: (
      <Frame w={740} h={210}>
        {["layers 1–25%", "26–50%", "51–75%", "76–100%"].map((t, i) => (
          <g key={t}>
            <GPU x={20 + i * 180} y={70} w={150} h={70} label={`GPU ${i + 1}`} />
            <Label x={95 + i * 180} y={160} size={10.5} color="#5E6B76">{t}</Label>
            {i < 3 && <Arrow x1={170 + i * 180} y1={105} x2={198 + i * 180} y2={105} accent={I} animated={i === 0} />}
          </g>
        ))}
        <Warn x={300} y={30} text="idle pipeline bubbles" />
      </Frame>
    ),
  },
  /* p330 — Fig 8.6 micro-batching */
  {
    page: 330, chapter: 8, stage: "inference", accent: I, archetype: "single-concept",
    section: "Tensor parallelism",
    term: "MICRO-BATCHING", title: "Micro-batches shrink the bubbles (Fig 8.6)",
    caption:
      "Micro-batching splits the input batch into sub-batches so GPUs stay busy: once GPU 0 finishes micro-batch F0,0, GPU 1 starts F1,0 while GPU 0 begins F0,1 — overlapping work and reducing pipeline bubbles.",
    diagram: (
      <Frame w={740} h={210}>
        {[0, 1, 2, 3].map((g) => (
          <g key={g}>
            <Label x={30} y={55 + g * 38} anchor="end" size={10.5} color="#5E6B76">{`GPU ${g}`}</Label>
            {[0, 1, 2, 3].map((m) => (
              <rect key={m} x={50 + (g + m) * 60} y={42 + g * 38} width={54} height={26} rx={5} fill={`${I}26`} stroke={I} strokeWidth={1.3} />
            ))}
          </g>
        ))}
        <Label x={400} y={195} size={11} color="#5E6B76">staggered micro-batches keep GPUs busy</Label>
      </Frame>
    ),
  },
  /* p331 — Fig 8.7 tensor parallelism */
  {
    page: 331, chapter: 8, stage: "inference", accent: I, archetype: "architecture",
    section: "Tensor parallelism",
    term: "TENSOR PARALLEL", title: "Split weight matrices across GPUs (Fig 8.7)",
    caption:
      "Tensor parallelism partitions large matrices (MLP weights, attention heads) column-wise across GPUs. Inputs broadcast to all; each computes its slice; an all-reduce aggregates the partial results. Needs fast interconnects.",
    diagram: (
      <Frame w={740} h={210}>
        <Pill x={30} y={95} text="input (broadcast)" accent={I} w={150} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <GPU x={230 + i * 130} y={45} w={110} h={70} label={`W slice ${i + 1}`} />
            <Label x={285 + i * 130} y={130} size={10.5} color="#5E6B76">{`GPU ${i + 1}`}</Label>
          </g>
        ))}
        <LabelBox x={300} y={155} w={170} h={40} text="all-reduce → output" accent={I} strong />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={180} y1={110} x2={230 + i * 130} y2={80} accent={I} animated={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p332 — Fig 8.8 combining */
  {
    page: 332, chapter: 8, stage: "inference", accent: I, archetype: "comparison",
    section: "Model quantization",
    term: "COMBINE", title: "Four ways to map a model to GPUs (Fig 8.8)",
    caption:
      "The three parallelisms are orthogonal and combinable: single GPU (whole model), data (replicate), pipeline (split layers, max memory saving), tensor (split matrices, low latency). In practice: a few pipeline stages with tensor parallelism inside each.",
    diagram: (
      <Frame w={740} h={210}>
        {[
          ["single GPU", "whole model"],
          ["data", "replicate"],
          ["pipeline", "split layers"],
          ["tensor", "split matrices"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={20 + i * 180} y={70} w={160} h={70} text={t as string} sub={sub as string} accent={I} strong={i === 3} />
        ))}
      </Frame>
    ),
  },
  /* p333 — PTQ vs QAT */
  {
    page: 333, chapter: 8, stage: "inference", accent: I, archetype: "comparison",
    section: "Introduction to quantization",
    term: "QUANTIZATION", title: "PTQ vs QAT",
    caption:
      "Quantization lowers weight/activation precision to save memory and speed inference. Post-Training Quantization (PTQ) converts a trained model directly (easy, some quality loss); Quantization-Aware Training (QAT) quantizes during training (better quality, more compute).",
    diagram: (
      <Frame w={720} h={210}>
        <LabelBox x={40} y={70} w={260} h={70} text="PTQ" sub="convert after training · easy" accent={I} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="QAT" sub="quantize during training" accent={I} strong />
      </Frame>
    ),
  },
  /* p334 — Fig 8.9 FP formats */
  {
    page: 334, chapter: 8, stage: "inference", accent: I, archetype: "comparison",
    section: "Introduction to quantization",
    term: "FP FORMATS", title: "FP32 vs FP16 vs BF16 (Fig 8.9)",
    caption:
      "Floating-point = sign + exponent (range) + significand (precision). FP32: 1+8+23 bits. FP16: 1+5+10. BF16: 1+8+7 — same range as FP32, less precision. Networks prefer range, so BF16 is preferred when supported.",
    diagram: (
      <Frame w={740} h={230}>
        {[
          ["FP32", 8, 23, 60],
          ["FP16", 5, 10, 120],
          ["BF16", 8, 7, 180],
        ].map(([name, exp, man, y], r) => {
          const total = 1 + (exp as number) + (man as number);
          const unit = 600 / 32;
          return (
            <g key={r}>
              <Label x={20} y={(y as number) + 14} anchor="start" size={11.5} weight={700}>{name as string}</Label>
              <rect x={90} y={y as number} width={unit} height={26} rx={3} fill={`${I}cc`} />
              <rect x={90 + unit} y={y as number} width={unit * (exp as number)} height={26} rx={3} fill={`${I}66`} />
              <rect x={90 + unit * (1 + (exp as number))} y={y as number} width={unit * (man as number)} height={26} rx={3} fill={`${I}22`} stroke={I} strokeWidth={1} />
              <Label x={100 + unit * total + 10} y={(y as number) + 14} anchor="start" size={10} color="#5E6B76">{`1 + ${exp} exp + ${man} mantissa`}</Label>
            </g>
          );
        })}
      </Frame>
    ),
  },
  /* p335 — absmax INT8 */
  {
    page: 335, chapter: 8, stage: "inference", accent: I, archetype: "formula-as-blocks",
    section: "Introduction to quantization",
    term: "ABSMAX", title: "Absmax quantization to INT8",
    caption:
      "Absmax maps weights to [-127, 127] by dividing by the absolute max and scaling: X_quant = round(127·X / max|X|). E.g. 0.1 with max 3.2 → round(127·0.1/3.2) = 4; dequantized back ≈ 0.1008 (rounding error 0.0008).",
    diagram: (
      <Frame w={740} h={200}>
        <LabelBox x={40} y={75} w={120} h={50} text="X (FP32)" accent={I} />
        <LabelBox x={250} y={70} w={200} h={60} text="round(127·X / max|X|)" accent={I} strong />
        <LabelBox x={540} y={75} w={120} h={50} text="INT8" accent={I} />
        <Arrow x1={160} y1={100} x2={248} y2={100} accent={I} />
        <Arrow x1={450} y1={100} x2={538} y2={100} accent={I} />
        <Label x={370} y={165} size={11} color="#5E6B76">0.1 (max 3.2) → 4</Label>
      </Frame>
    ),
  },
  /* p336 — zero-point */
  {
    page: 336, chapter: 8, stage: "inference", accent: I, archetype: "comparison",
    section: "Introduction to quantization",
    term: "ZERO-POINT", title: "Zero-point handles asymmetric ranges",
    caption:
      "Zero-point quantization handles asymmetric distributions by adding an offset: X_quant = round(scale·X + zeropoint), mapping to [-128, 127]. The same 0.1 maps to −1 here (vs 4 for absmax).",
    diagram: (
      <Frame w={720} h={200}>
        <LabelBox x={40} y={70} w={240} h={70} text="absmax" sub="symmetric → 4" accent={I} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <LabelBox x={420} y={70} w={260} h={70} text="zero-point" sub="asymmetric + offset → −1" accent={I} strong />
      </Frame>
    ),
  },
  /* p337 — Fig 8.11 outliers / LLM.int8 */
  {
    page: 337, chapter: 8, stage: "inference", accent: I, archetype: "single-concept",
    section: "Introduction to quantization",
    term: "LLM.int8()", title: "Keep outliers in FP16, rest in INT8",
    caption:
      "Outlier features (~0.1% of values) wreck naive quantization. LLM.int8() uses mixed precision: outlier columns multiply in FP16, the rest in INT8, then results recombine — ~2× smaller with <1% degradation (but ~20% slower).",
    diagram: (
      <Frame w={720} h={210}>
        <Boundary x={40} y={50} w={300} h={120} title="weight matrix" accent={I} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={60 + i * 55} y={80} width={44} height={60} rx={6} fill={i === 2 ? "#EF5C4640" : `${I}1A`} stroke={i === 2 ? "#EF5C46" : I} strokeWidth={i === 2 ? 2 : 1.3} />
        ))}
        <Warn x={170} y={185} text="outliers ~0.1%" />
        <LabelBox x={430} y={55} w={200} h={48} text="outliers → FP16" accent={I} />
        <LabelBox x={430} y={120} w={200} h={48} text="rest → INT8" accent={I} strong />
        <Arrow x1={340} y1={90} x2={428} y2={79} accent={I} animated={false} />
        <Arrow x1={340} y1={130} x2={428} y2={144} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p338 — NF4 + GGUF intro */
  {
    page: 338, chapter: 8, stage: "inference", accent: I, archetype: "single-concept",
    section: "Quantization with GGUF and llama.cpp",
    term: "NF4 · llama.cpp", title: "4-bit NF4 and the llama.cpp path",
    caption:
      "NF4 is a 4-bit format (from QLoRA, needs bitsandbytes) loadable via load_in_4bit. llama.cpp — Gerganov’s open-source C++ engine — runs LLMs broadly (CPU, Android, GPU offload) and defines the popular GGUF quantization format.",
    diagram: (
      <Frame w={720} h={210}>
        <BrandNode x={30} y={50} name="bitsandbytes" sub="NF4 · load_in_4bit" w={200} />
        <BrandNode x={30} y={120} name="llama.cpp" sub="CPU + GPU offload" w={200} />
        <ModelGlyph x={420} y={70} w={110} h={90} accent={I} />
        <Pill x={560} y={95} text="GGUF" accent={I} w={130} />
        <Arrow x1={230} y1={85} x2={418} y2={100} accent={I} animated={false} />
        <Arrow x1={230} y1={150} x2={418} y2={130} accent={I} animated={false} />
        <Arrow x1={530} y1={110} x2={558} y2={110} accent={I} />
      </Frame>
    ),
  },
  /* p339 — GGUF precision levels */
  {
    page: 339, chapter: 8, stage: "inference", accent: I, archetype: "list-cluster",
    section: "Quantization with GGUF and llama.cpp",
    term: "GGUF LEVELS", title: "Q2 (low) → Q8 (highest quality)",
    caption:
      "GGUF groups values into blocks (and super-blocks, e.g. Q4_K) rounded to lower precision. Naming runs from 1-bit (IQ1) to 8-bit (Q8_0): higher bits = higher quality + bigger files.",
    diagram: (
      <Frame w={740} h={200}>
        {[
          ["Q2_K", "low"],
          ["Q3_K", "usable (big models)"],
          ["Q4_K_M", "good · common"],
          ["Q5_K", "high"],
          ["Q6_K / Q8_0", "highest"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <rect x={20 + i * 144} y={70} width={130} height={50 + i * 8} rx={8} fill={`${I}${(0x22 + i * 0x22).toString(16)}`} stroke={I} strokeWidth={1.5} />
            <Label x={85 + i * 144} y={95 + i * 4} size={11.5} weight={700}>{t as string}</Label>
            <Label x={85 + i * 144} y={150} size={9.5} color="#5E6B76">{sub as string}</Label>
          </g>
        ))}
      </Frame>
    ),
  },
  /* p340 — GGUF workflow */
  {
    page: 340, chapter: 8, stage: "inference", accent: I, archetype: "pipeline-flow",
    section: "Quantization with GPTQ and EXL2",
    term: "GGUF WORKFLOW", title: "Convert FP16 → quantize → Hub",
    caption:
      "Quantize with llama.cpp: clone the model, convert to an intermediate FP16, then quantize to a chosen method (e.g. Q4_K_M), and push the GGUF to the Hub. Use it via llama-cpp-python, LangChain, or LM Studio.",
    diagram: (
      <Frame w={740} h={210}>
        <BrandNode x={20} y={85} name="Hugging Face" sub="source model" w={160} />
        <LabelBox x={210} y={85} w={110} h={56} text="→ FP16" accent={I} />
        <LabelBox x={350} y={85} w={130} h={56} text="quantize Q4_K_M" accent={I} strong />
        <Pill x={510} y={95} text="GGUF" accent={I} w={100} />
        <BrandNode x={640} y={87} name="LM Studio" w={90} />
        <Arrow x1={180} y1={113} x2={208} y2={113} accent={I} />
        <Arrow x1={320} y1={113} x2={348} y2={113} accent={I} />
        <Arrow x1={480} y1={113} x2={508} y2={113} accent={I} />
        <Arrow x1={610} y1={113} x2={638} y2={113} accent={I} animated={false} />
      </Frame>
    ),
  },
  /* p341 — GPTQ + EXL2 */
  {
    page: 341, chapter: 8, stage: "inference", accent: I, archetype: "comparison",
    section: "Quantization with GPTQ and EXL2",
    term: "GPTQ · EXL2", title: "GPU-only quants via ExLlamaV2",
    caption:
      "GPTQ and EXL2 are GPU-dedicated (faster than llama.cpp), based on the GPTQ algorithm. GPTQ is 4-bit only; EXL2 mixes precisions (2–8 bits per weight), even per layer — running a 70B model on one 24 GB GPU at 2.55-bit. Both run on ExLlamaV2.",
    diagram: (
      <Frame w={720} h={210}>
        <BrandNode x={40} y={80} name="GPTQ" sub="4-bit only" w={250} />
        <Label x={360} y={105} size={16} weight={700} color="#97A0A8">vs</Label>
        <BrandNode x={420} y={80} name="EXL2" sub="mixed 2–8 bit / weight" w={260} />
        <BrandNode x={250} y={160} name="ExLlamaV2" sub="runs both" w={210} />
      </Frame>
    ),
  },
  /* p342 — other techniques */
  {
    page: 342, chapter: 8, stage: "inference", accent: I, archetype: "list-cluster",
    section: "Other quantization techniques",
    term: "OTHERS", title: "AWQ, QuIP#, HQQ",
    caption:
      "Beyond GGUF/GPTQ/EXL2: AWQ protects salient weights by activation magnitude (well-supported by TGI, vLLM, TensorRT-LLM); QuIP# and HQQ target extreme 1–2-bit quantization that preserves quality, especially for 30B+ models.",
    diagram: (
      <Frame w={720} h={200}>
        {[
          ["AWQ", "activation-aware"],
          ["QuIP#", "extreme 1–2 bit"],
          ["HQQ", "half-quadratic"],
        ].map(([t, sub], i) => (
          <LabelBox key={i} x={30 + i * 230} y={70} w={200} h={70} text={t as string} sub={sub as string} accent={I} strong={i === 0} />
        ))}
      </Frame>
    ),
  },
  /* p343 — engine comparison */
  {
    page: 343, chapter: 8, stage: "inference", accent: I, archetype: "comparison",
    section: "Summary",
    term: "ENGINES", title: "TGI vs vLLM vs TensorRT-LLM (Table 8.1)",
    caption:
      "The three inference engines overlap on continuous batching, FlashAttention-2, PagedAttention, tensor parallelism, and AWQ. TGI adds speculative decoding + EXL2; TensorRT-LLM adds pipeline parallelism + GPTQ. Choose by hardware, latency, and throughput needs.",
    diagram: (
      <Frame w={720} h={210}>
        {[
          ["TGI", "+ speculative, EXL2"],
          ["vLLM", "PagedAttention origin"],
          ["TensorRT-LLM", "+ pipeline, GPTQ"],
        ].map(([t, sub], i) => (
          <g key={i}>
            <BrandNode x={20 + i * 240} y={60} name={t as string} w={200} />
            <Label x={120 + i * 240} y={140} size={10.5} color="#5E6B76">{sub as string}</Label>
          </g>
        ))}
      </Frame>
    ),
  },
];
