// TOOL_REGISTRY — the living list of named products/tools this book uses.
// A tool either resolves to a real `simple-icons` logo (slug present in ICON_BY_SLUG)
// or falls back to a name-pill in its brand colour. Add to this list as each
// chapter introduces new tools.
//
// `brand` hexes for FALLBACK tools (not in simple-icons) are best-effort approximations
// of the vendor's primary colour; the official SVG can be dropped in later. Tools that
// DO resolve take their exact official hex from the icon data at render time.
import { ICON_BY_SLUG } from "./icons";

export interface ToolEntry {
  name: string; // display name
  slug?: string; // simple-icons slug, if it has one
  brand: string; // brand hex (official for resolved; approximate for fallback)
  stage?: string; // optional: which book stage first introduces it
  resolved: boolean; // true => real logo; false => fallback pill
}

interface Seed {
  name: string;
  slug?: string;
  fallbackBrand?: string; // used only when slug is missing/unresolved
  stage?: string;
}

const SEED: Seed[] = [
  { name: "Python", slug: "python", stage: "foundations" },
  { name: "Poetry", slug: "poetry", stage: "foundations" },
  { name: "Poe the Poet", fallbackBrand: "#6E56CF", stage: "foundations" }, // task runner, no official icon
  { name: "ZenML", fallbackBrand: "#7A3EF0", stage: "foundations" },
  { name: "Hugging Face", slug: "huggingface", stage: "feature" },
  { name: "Comet ML", fallbackBrand: "#6C5CE7", stage: "training" },
  { name: "Opik", fallbackBrand: "#B5179E", stage: "inference" },
  { name: "MongoDB", slug: "mongodb", stage: "feature" },
  { name: "Qdrant", slug: "qdrant", stage: "feature" },
  { name: "AWS", fallbackBrand: "#FF9900", stage: "operations" }, // not in simple-icons (trademark)
  { name: "AWS SageMaker", fallbackBrand: "#01A88D", stage: "training" },
  { name: "Docker", slug: "docker", stage: "operations" },
  { name: "GitHub", slug: "github", stage: "foundations" },
  { name: "GitHub Actions", slug: "githubactions", stage: "operations" },
  { name: "Selenium", slug: "selenium", stage: "feature" },
  { name: "FastAPI", slug: "fastapi", stage: "inference" },
  { name: "Pydantic", slug: "pydantic", stage: "feature" },
  { name: "LangChain", slug: "langchain", stage: "inference" },
  { name: "OpenAI", fallbackBrand: "#10A37F", stage: "training" }, // not in simple-icons
  { name: "Mistral", slug: "mistralai", stage: "training" },
  { name: "Meta Llama", slug: "meta", stage: "training" }, // Meta brand asset for the Llama line

  /* ---- Chapter 2: Tooling and Installation ---- */
  { name: "pyenv", fallbackBrand: "#2B9348", stage: "foundations" },
  { name: "uv", slug: "uv", stage: "foundations" },
  { name: "Pipenv", fallbackBrand: "#2B5B84", stage: "foundations" },
  { name: "Conda", slug: "anaconda", stage: "foundations" },
  { name: "Comet", fallbackBrand: "#6C5CE7", stage: "training" }, // Comet ML, short name
  { name: "Unsloth", fallbackBrand: "#00B86B", stage: "training" },
  { name: "Superlinked", fallbackBrand: "#6C47FF", stage: "feature" },
  // orchestrator alternatives
  { name: "Apache Airflow", slug: "apacheairflow", stage: "foundations" },
  { name: "Prefect", slug: "prefect", stage: "foundations" },
  { name: "Metaflow", fallbackBrand: "#3B49DF", stage: "foundations" },
  { name: "Dagster", fallbackBrand: "#4F43DD", stage: "foundations" },
  { name: "Kubeflow", fallbackBrand: "#1A73E8", stage: "foundations" },
  { name: "Argo Workflows", fallbackBrand: "#EF7B4D", stage: "foundations" },
  { name: "Kubernetes", slug: "kubernetes", stage: "operations" },
  // experiment-tracker alternatives
  { name: "Weights & Biases", slug: "weightsandbiases", stage: "training" },
  { name: "MLflow", slug: "mlflow", stage: "training" },
  { name: "Neptune", slug: "neptune", stage: "training" },
  // prompt-monitoring alternatives
  { name: "Langfuse", fallbackBrand: "#0EA5E9", stage: "inference" },
  { name: "LangSmith", fallbackBrand: "#2D6A4F", stage: "inference" },
  { name: "Galileo", fallbackBrand: "#E5484D", stage: "inference" },
  // vector-DB alternatives
  { name: "Milvus", slug: "milvus", stage: "feature" },
  { name: "Redis", slug: "redis", stage: "feature" },
  { name: "Weaviate", fallbackBrand: "#1DA584", stage: "feature" },
  { name: "Pinecone", fallbackBrand: "#111827", stage: "feature" },
  { name: "Chroma", fallbackBrand: "#FF6F4C", stage: "feature" },
  { name: "pgvector", slug: "postgresql", stage: "feature" }, // PostgreSQL extension
  // AWS sub-services + cloud alternatives
  { name: "AWS Bedrock", fallbackBrand: "#FF9900", stage: "training" },
  { name: "AWS S3", fallbackBrand: "#569A31", stage: "operations" },
  { name: "AWS ECR", fallbackBrand: "#FF9900", stage: "operations" },
  { name: "AWS EC2", fallbackBrand: "#FF9900", stage: "operations" },
  { name: "AWS EKS", fallbackBrand: "#FF9900", stage: "operations" },
  { name: "AWS ECS", fallbackBrand: "#FF9900", stage: "operations" },
  { name: "Google Cloud", slug: "googlecloud", stage: "operations" },
  { name: "Vertex AI", fallbackBrand: "#4285F4", stage: "operations" },
  { name: "Azure", fallbackBrand: "#0078D4", stage: "operations" },

  /* ---- Chapter 3: Data Engineering (Selenium/FastAPI/Pydantic/LangChain already above) ---- */
  { name: "Google Chrome", slug: "googlechrome", stage: "feature" },
  { name: "BeautifulSoup", fallbackBrand: "#3CB371", stage: "feature" },
  { name: "Scrapy", slug: "scrapy", stage: "feature" },
  { name: "Crawl4AI", fallbackBrand: "#7C3AED", stage: "feature" },
  { name: "SQLAlchemy", slug: "sqlalchemy", stage: "feature" },
  { name: "SQLModel", fallbackBrand: "#7E56C2", stage: "feature" },
  { name: "mongoengine", fallbackBrand: "#13AA52", stage: "feature" },
  { name: "MySQL", slug: "mysql", stage: "feature" },
  { name: "SQLite", slug: "sqlite", stage: "feature" },
  { name: "Snowflake", slug: "snowflake", stage: "feature" },
  { name: "Google BigQuery", slug: "googlebigquery", stage: "feature" },
  { name: "Pulumi", slug: "pulumi", stage: "operations" },

  /* ---- Chapter 4: RAG Feature Pipeline ---- */
  { name: "Apache Kafka", slug: "apachekafka", stage: "feature" },
  { name: "Apache Flink", slug: "apacheflink", stage: "feature" },
  { name: "Redpanda", fallbackBrand: "#E2401B", stage: "feature" },
  { name: "RabbitMQ", slug: "rabbitmq", stage: "feature" },
  { name: "Bytewax", fallbackBrand: "#FFB400", stage: "feature" },
  { name: "Sentence Transformers", fallbackBrand: "#EE9613", stage: "feature" }, // SBERT
  { name: "Unstructured", fallbackBrand: "#097285", stage: "feature" },
  { name: "FAISS", fallbackBrand: "#0866FF", stage: "feature" }, // Meta FAISS
  { name: "LangFuse", fallbackBrand: "#0EA5E9", stage: "inference" }, // prompt mgmt (alias of Langfuse)
  { name: "CLIP", fallbackBrand: "#6E56CF", stage: "feature" }, // OpenAI multimodal model

  /* ---- Chapter 5: Supervised Fine-Tuning ---- */
  { name: "Argilla", fallbackBrand: "#FF675F", stage: "training" },
  { name: "Nomic Atlas", fallbackBrand: "#1B1F3B", stage: "training" },
  { name: "RunPod", fallbackBrand: "#673AB7", stage: "training" },
  { name: "TGI", fallbackBrand: "#FFD21E", stage: "inference" }, // HF Text Generation Inference
  { name: "TRL", fallbackBrand: "#FFD21E", stage: "training" }, // HF TRL
  { name: "Axolotl", fallbackBrand: "#3B6FB6", stage: "training" },
  { name: "Outlines", fallbackBrand: "#111827", stage: "training" },
  { name: "Google Colab", slug: "googlecolab", stage: "training" },
  { name: "Lambda Labs", fallbackBrand: "#4F46E5", stage: "training" },
  { name: "spaCy", slug: "spacy", stage: "feature" },
  { name: "NumPy", slug: "numpy", stage: "feature" },
  { name: "pandas", slug: "pandas", stage: "feature" },
  { name: "Jinja", slug: "jinja", stage: "training" },
  { name: "Gemma", fallbackBrand: "#4285F4", stage: "training" }, // Google Gemma
  { name: "GPT-4o", fallbackBrand: "#10A37F", stage: "training" }, // OpenAI

  /* ---- Chapter 7: Evaluating LLMs ---- */
  { name: "vLLM", slug: "vllm", stage: "inference" },
  { name: "Ragas", fallbackBrand: "#6C2BD9", stage: "training" },
  { name: "ARES", fallbackBrand: "#0F766E", stage: "training" },
  { name: "lm-eval-harness", fallbackBrand: "#5A2EC8", stage: "training" }, // EleutherAI
  { name: "lighteval", fallbackBrand: "#FFD21E", stage: "training" }, // Hugging Face

  /* ---- Chapter 8: Inference Optimization (TGI already above) ---- */
  { name: "TensorRT-LLM", fallbackBrand: "#76B900", stage: "inference" }, // NVIDIA green
  { name: "NVIDIA", slug: "nvidia", stage: "inference" },
  { name: "llama.cpp", fallbackBrand: "#5A3E2B", stage: "inference" },
  { name: "GPTQ", fallbackBrand: "#B5179E", stage: "inference" },
  { name: "EXL2", fallbackBrand: "#0F766E", stage: "inference" },
  { name: "ExLlamaV2", fallbackBrand: "#0F766E", stage: "inference" },
  { name: "PyTorch", slug: "pytorch", stage: "inference" },
  { name: "DeepSpeed", fallbackBrand: "#1857C0", stage: "inference" },
  { name: "Megatron-LM", fallbackBrand: "#76B900", stage: "inference" },
  { name: "LM Studio", slug: "lmstudio", stage: "inference" },
  { name: "bitsandbytes", fallbackBrand: "#F59E0B", stage: "inference" },
  { name: "Qwen", slug: "qwen", stage: "inference" },
  { name: "AWQ", fallbackBrand: "#7C3AED", stage: "inference" },
  { name: "Beam", fallbackBrand: "#1A73E8", stage: "inference" },

  /* ---- Chapter 9: RAG Inference Pipeline ---- */
  { name: "LlamaIndex", fallbackBrand: "#1B1B1F", stage: "inference" },
  { name: "Haystack", slug: "haystack", stage: "inference" },

  /* ---- Chapter 10: Inference Pipeline Deployment ---- */
  { name: "Terraform", slug: "terraform", stage: "operations" },
  { name: "AWS CloudWatch", fallbackBrand: "#FF4F8B", stage: "operations" },
  { name: "BentoML", fallbackBrand: "#000000", stage: "inference" },
  { name: "uvicorn", fallbackBrand: "#2094F3", stage: "inference" },

  /* ---- Chapter 11: MLOps and LLMOps ---- */
  { name: "Ruff", slug: "ruff", stage: "operations" },
  { name: "gitleaks", fallbackBrand: "#EF4444", stage: "operations" },
  { name: "Pytest", slug: "pytest", stage: "operations" },
  { name: "GitLab", slug: "gitlab", stage: "operations" },
  { name: "CircleCI", slug: "circleci", stage: "operations" },
  { name: "Jenkins", slug: "jenkins", stage: "operations" },
  { name: "DVC", slug: "dvc", stage: "operations" },
  { name: "Discord", slug: "discord", stage: "operations" },
  { name: "Slack", fallbackBrand: "#4A154B", stage: "operations" },
  { name: "GitHub Copilot", slug: "githubcopilot", stage: "operations" },
  { name: "AWS CloudFormation", fallbackBrand: "#E7157B", stage: "operations" },
  { name: "Tecton", fallbackBrand: "#1F6FEB", stage: "operations" },
  { name: "Featureform", fallbackBrand: "#FF6B35", stage: "operations" },
  { name: "Hopsworks", fallbackBrand: "#1EB182", stage: "operations" },
  { name: "Qwak", fallbackBrand: "#6C2BD9", stage: "operations" },
];

export const TOOL_REGISTRY: ToolEntry[] = SEED.map((s) => {
  const icon = s.slug ? ICON_BY_SLUG[s.slug] : undefined;
  if (icon) {
    return { name: s.name, slug: s.slug, brand: `#${icon.hex}`, stage: s.stage, resolved: true };
  }
  return { name: s.name, slug: undefined, brand: s.fallbackBrand ?? "#5E6B76", stage: s.stage, resolved: false };
});

export function getTool(name: string): ToolEntry | undefined {
  return TOOL_REGISTRY.find((t) => t.name.toLowerCase() === name.toLowerCase());
}
