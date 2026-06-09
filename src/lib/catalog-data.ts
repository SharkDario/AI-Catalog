export type License = "Open Source" | "Commercial" | "Free";

export interface Software {
  id: string;
  name: string;
  objective: string;
  description: string;
  category: string;
  license: License;
  year: number;
  author: string;
  rating: number;
  views: number;
  website: string;
  video?: string;
  color: string;
}

export const categories = [
  "Machine Learning",
  "NLP",
  "Computer Vision",
  "Generative AI",
  "Robotics",
  "Multi-agent",
];

export const authors = ["OpenAI", "Google", "Meta", "Anthropic", "Hugging Face", "Stability AI", "DeepMind"];

export const software: Software[] = [
  { id: "gpt-4", name: "GPT-4", objective: "Large multimodal language model for reasoning & generation.", description: "GPT-4 is a multimodal large language model created by OpenAI capable of natural language reasoning, code generation, image understanding, and tool use. It powers ChatGPT and thousands of enterprise applications.", category: "NLP", license: "Commercial", year: 2023, author: "OpenAI", rating: 4.8, views: 18420, website: "https://openai.com/gpt-4", video: "dQw4w9WgXcQ", color: "#a78bfa" },
  { id: "llama-3", name: "Llama 3", objective: "Open foundation LLM for research and production.", description: "Meta's Llama 3 family offers open weights at multiple scales, optimized for dialogue, reasoning and instruction following. Widely used as a base for fine-tuning.", category: "NLP", license: "Open Source", year: 2024, author: "Meta", rating: 4.6, views: 14300, website: "https://llama.meta.com", color: "#5eead4" },
  { id: "stable-diffusion", name: "Stable Diffusion XL", objective: "High-fidelity text-to-image generation.", description: "Stable Diffusion XL is a latent diffusion model producing photo-realistic images from text prompts. Open weights enable on-device generation and fine-tuning.", category: "Generative AI", license: "Open Source", year: 2023, author: "Stability AI", rating: 4.5, views: 12750, website: "https://stability.ai", color: "#f472b6" },
  { id: "claude-3", name: "Claude 3", objective: "Helpful, harmless, honest conversational AI.", description: "Anthropic's Claude 3 family (Haiku, Sonnet, Opus) emphasizes long-context reasoning, structured outputs and safety via constitutional AI.", category: "NLP", license: "Commercial", year: 2024, author: "Anthropic", rating: 4.7, views: 11200, website: "https://anthropic.com", color: "#fbbf24" },
  { id: "yolov8", name: "YOLOv8", objective: "Real-time object detection and segmentation.", description: "YOLOv8 is the latest in the You-Only-Look-Once family — a fast, accurate detector for objects, segments and poses, deployable on edge devices.", category: "Computer Vision", license: "Open Source", year: 2023, author: "Hugging Face", rating: 4.4, views: 9800, website: "https://ultralytics.com", color: "#34d399" },
  { id: "alphafold", name: "AlphaFold 3", objective: "Protein structure prediction at atomic accuracy.", description: "DeepMind's AlphaFold 3 predicts the 3D structure of proteins and their interactions, accelerating drug discovery and molecular biology.", category: "Machine Learning", license: "Free", year: 2024, author: "DeepMind", rating: 4.9, views: 8700, website: "https://deepmind.google", color: "#60a5fa" },
  { id: "whisper", name: "Whisper", objective: "Robust multilingual speech recognition.", description: "OpenAI Whisper is an open-source automatic speech recognition model trained on 680k hours of multilingual data with strong noise robustness.", category: "NLP", license: "Open Source", year: 2022, author: "OpenAI", rating: 4.5, views: 7600, website: "https://openai.com/research/whisper", color: "#a78bfa" },
  { id: "autogpt", name: "AutoGPT", objective: "Autonomous multi-agent task execution.", description: "AutoGPT orchestrates LLM agents with planning, memory and tools to autonomously break down and execute complex goals.", category: "Multi-agent", license: "Open Source", year: 2023, author: "Hugging Face", rating: 4.1, views: 6900, website: "https://agpt.co", color: "#f472b6" },
  { id: "gemini", name: "Gemini 1.5", objective: "Native multimodal model with 1M token context.", description: "Google's Gemini 1.5 handles text, images, audio and video with a 1-million-token context window, ideal for document analysis and code.", category: "Generative AI", license: "Commercial", year: 2024, author: "Google", rating: 4.6, views: 10400, website: "https://deepmind.google/gemini", color: "#60a5fa" },
  { id: "ros2", name: "ROS 2", objective: "Open-source robot operating system.", description: "ROS 2 is a flexible framework for writing robot software, with real-time middleware and a thriving ecosystem of perception & control packages.", category: "Robotics", license: "Open Source", year: 2017, author: "Google", rating: 4.3, views: 5400, website: "https://ros.org", color: "#34d399" },
  { id: "segment-anything", name: "Segment Anything", objective: "Promptable image segmentation foundation model.", description: "SAM from Meta segments any object in an image with point, box or text prompts. Trained on 1B masks, generalizes zero-shot.", category: "Computer Vision", license: "Open Source", year: 2023, author: "Meta", rating: 4.6, views: 8100, website: "https://segment-anything.com", color: "#5eead4" },
  { id: "midjourney", name: "Midjourney v6", objective: "Artistic text-to-image diffusion model.", description: "Midjourney generates highly stylized, painterly images from text prompts, accessed via Discord and web. Known for aesthetic quality.", category: "Generative AI", license: "Commercial", year: 2024, author: "Stability AI", rating: 4.7, views: 13900, website: "https://midjourney.com", color: "#f472b6" },
];

export const classifications = [
  { id: "reactive", title: "Reactive Systems", color: "#a78bfa", description: "Stateless agents that respond to current perceptions with no memory of past events. They map inputs directly to actions.", examples: ["IBM Deep Blue", "Thermostats", "Basic chatbots"], link: "https://en.wikipedia.org/wiki/Reactive_planning" },
  { id: "deliberative", title: "Deliberative Systems", color: "#5eead4", description: "Maintain an internal world model and plan multi-step actions using symbolic reasoning before acting.", examples: ["STRIPS planner", "Autonomous Mars rovers", "Chess engines"], link: "https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence" },
  { id: "hybrid", title: "Hybrid Systems", color: "#f472b6", description: "Combine reactive layers for fast reflexes with deliberative layers for long-term planning.", examples: ["Self-driving stacks", "Boston Dynamics robots", "Smart home assistants"], link: "https://en.wikipedia.org/wiki/Hybrid_intelligent_system" },
  { id: "learning", title: "Learning-based Systems", color: "#60a5fa", description: "Improve performance over time from data via supervised, unsupervised or reinforcement learning.", examples: ["GPT-4", "AlphaGo", "Recommender systems"], link: "https://en.wikipedia.org/wiki/Machine_learning" },
  { id: "multi-agent", title: "Multi-agent Systems", color: "#fbbf24", description: "Multiple autonomous agents interact, cooperate or compete to solve problems beyond any single agent's capability.", examples: ["AutoGPT", "Swarm robotics", "Traffic simulation"], link: "https://en.wikipedia.org/wiki/Multi-agent_system" },
  { id: "neuro-symbolic", title: "Neuro-Symbolic", color: "#34d399", description: "Fuse neural learning with symbolic reasoning to gain both pattern recognition and explainable logic.", examples: ["IBM Neuro-Symbolic AI", "DeepProbLog", "AlphaGeometry"], link: "https://en.wikipedia.org/wiki/Neuro-symbolic_AI" },
];

export const threads = [
  { id: "future-of-llms", title: "Where are LLMs heading in 2026?", category: "NLP", replies: 47, lastActivity: "2h ago" },
  { id: "open-vs-closed", title: "Open-source vs closed models — who wins?", category: "Generative AI", replies: 122, lastActivity: "15m ago" },
  { id: "vision-transformers", title: "Are ViTs replacing CNNs everywhere?", category: "Computer Vision", replies: 31, lastActivity: "1d ago" },
  { id: "multi-agent-future", title: "Multi-agent orchestration patterns", category: "Multi-agent", replies: 18, lastActivity: "5h ago" },
  { id: "robotics-llm", title: "Combining LLMs with robotics control", category: "Robotics", replies: 24, lastActivity: "3h ago" },
  { id: "rating-systems", title: "How do you rate an AI tool fairly?", category: "Machine Learning", replies: 9, lastActivity: "2d ago" },
];

export const sampleComments = [
  { user: "Ada L.", initials: "AL", time: "2h ago", text: "I think transformers will remain dominant but mixture-of-experts will scale faster than dense models." },
  { user: "Alan T.", initials: "AT", time: "1h ago", text: "Agreed. The bottleneck is data quality, not compute." },
  { user: "Grace H.", initials: "GH", time: "32m ago", text: "Don't underestimate small specialized models — they're winning on cost." },
];
