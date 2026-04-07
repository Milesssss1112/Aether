window.AETHER_RESOURCES = {"resources":[
  {
    "id": "midjourney-complete-guide",
    "title": "Midjourney Complete Usage Guide",
    "category": "guide",
    "tool": "Midjourney",
    "tags": ["Image Generation", "Prompts", "Beginner"],
    "summary": "Master Midjourney from scratch — account setup, core commands, prompt techniques, and advanced parameters.",
    "icon": "image",
    "difficulty": "beginner",
    "readTime": "15 min",
    "sections": [
      {
        "title": "Quick Start",
        "type": "steps",
        "content": "1. Join the Midjourney Discord server\n2. Type /imagine in a #newbies channel\n3. Describe the image you want (English works best)\n4. Wait ~60 seconds for 4 images to generate\n5. Click U1–U4 to upscale, V1–V4 for variations"
      },
      {
        "title": "Core Commands",
        "type": "code",
        "content": "/imagine  — Generate an image (most used)\n/settings — Adjust default settings\n/info     — View account info and credits\n/blend    — Blend multiple images together\n/describe — Analyze an image and get prompts\n/shorten  — Condense an overly long prompt"
      },
      {
        "title": "Common Parameters",
        "type": "code",
        "content": "--ar 16:9       Set aspect ratio (16:9 landscape / 9:16 portrait / 1:1 square)\n--v 6           Use the latest version v6\n--style raw     Less AI beautification, more realistic\n--q 2           Higher quality (uses 2x credits)\n--no text,logo  Negative prompt: exclude text and logos\n--seed 12345    Fix the random seed to reproduce results"
      },
      {
        "title": "Golden Prompt Structure",
        "type": "template",
        "content": "[Subject description] [Environment / background] [Lighting] [Art style] [Parameters]\n\nExamples:\nA young woman reading in a cozy library, warm afternoon light streaming through tall windows, oil painting style, detailed brushwork --ar 3:4 --v 6\n\na futuristic city skyline at dusk, neon reflections on wet streets, cyberpunk aesthetic, cinematic photography --ar 16:9 --style raw"
      },
      {
        "title": "Style Keywords Reference",
        "type": "table",
        "content": "Realistic | photorealistic, hyperrealistic, 8k uhd, DSLR photo\nIllustration | digital illustration, concept art, artstation trending\nOil Painting | oil painting, impasto, impressionist style\nWatercolor | watercolor painting, soft edges, paper texture\n3D Render | 3D render, octane render, cinema 4D, studio lighting\nAnime | anime style, Studio Ghibli, manga illustration"
      }
    ]
  },
  {
    "id": "chatgpt-api-guide",
    "title": "ChatGPT / OpenAI API Developer Guide",
    "category": "api",
    "tool": "OpenAI",
    "tags": ["API", "Development", "Python", "GPT"],
    "summary": "Learn how to call the OpenAI API — authentication, model selection, streaming, function calling, and cost control.",
    "icon": "code",
    "difficulty": "intermediate",
    "readTime": "20 min",
    "sections": [
      {
        "title": "Installation & Authentication",
        "type": "code",
        "content": "# Install\npip install openai\n\n# Basic initialization\nfrom openai import OpenAI\nclient = OpenAI(api_key=\"sk-...\")\n\n# Recommended: read from environment variable\nimport os\nclient = OpenAI(api_key=os.environ.get(\"OPENAI_API_KEY\"))"
      },
      {
        "title": "Basic Chat Completion",
        "type": "code",
        "content": "response = client.chat.completions.create(\n    model=\"gpt-4o\",\n    messages=[\n        {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n        {\"role\": \"user\", \"content\": \"Introduce yourself\"}\n    ],\n    temperature=0.7,\n    max_tokens=500\n)\nprint(response.choices[0].message.content)"
      },
      {
        "title": "Streaming Output",
        "type": "code",
        "content": "stream = client.chat.completions.create(\n    model=\"gpt-4o\",\n    messages=[{\"role\": \"user\", \"content\": \"Write a poem\"}],\n    stream=True\n)\n\nfor chunk in stream:\n    delta = chunk.choices[0].delta\n    if delta.content:\n        print(delta.content, end=\"\", flush=True)"
      },
      {
        "title": "Function Calling",
        "type": "code",
        "content": "tools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_weather\",\n        \"description\": \"Get current weather for a city\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"location\": {\"type\": \"string\", \"description\": \"City name\"}\n            },\n            \"required\": [\"location\"]\n        }\n    }\n}]\n\nresponse = client.chat.completions.create(\n    model=\"gpt-4o\",\n    tools=tools,\n    messages=[{\"role\": \"user\", \"content\": \"What's the weather in Tokyo?\"}]\n)"
      },
      {
        "title": "Model & Cost Comparison",
        "type": "table",
        "content": "gpt-4o | Best reasoning + vision | $5/$15 per 1M tokens | Best for complex tasks\ngpt-4o-mini | Lightweight & fast | $0.15/$0.6 per 1M | Simple tasks / high concurrency\no1 | Deep reasoning | $15/$60 per 1M | Math / code / science\no1-mini | Lightweight reasoning | $3/$12 per 1M | Reasoning on a budget"
      }
    ]
  },
  {
    "id": "claude-api-guide",
    "title": "Claude / Anthropic API Complete Guide",
    "category": "api",
    "tool": "Claude",
    "tags": ["API", "Anthropic", "Development", "Python"],
    "summary": "Build AI apps with the Anthropic Claude API — Messages API, tool use, vision, and streaming output.",
    "icon": "api",
    "difficulty": "intermediate",
    "readTime": "25 min",
    "sections": [
      {
        "title": "Installation & Quick Start",
        "type": "code",
        "content": "pip install anthropic\n\nimport anthropic\nclient = anthropic.Anthropic(api_key=\"sk-ant-...\")\n\nmessage = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    messages=[{\"role\": \"user\", \"content\": \"Hello!\"}]\n)\nprint(message.content[0].text)"
      },
      {
        "title": "Streaming Output",
        "type": "code",
        "content": "with client.messages.stream(\n    model=\"claude-sonnet-4-6\",\n    max_tokens=1024,\n    messages=[{\"role\": \"user\", \"content\": \"Write a short essay\"}]\n) as stream:\n    for text in stream.text_stream:\n        print(text, end=\"\", flush=True)"
      },
      {
        "title": "Tool Use",
        "type": "code",
        "content": "tools = [{\n    \"name\": \"calculator\",\n    \"description\": \"Perform mathematical calculations\",\n    \"input_schema\": {\n        \"type\": \"object\",\n        \"properties\": {\n            \"expression\": {\"type\": \"string\", \"description\": \"Math expression\"}\n        },\n        \"required\": [\"expression\"]\n    }\n}]\n\nresponse = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    tools=tools,\n    messages=[{\"role\": \"user\", \"content\": \"What is 123 * 456?\"}]\n)"
      },
      {
        "title": "Vision (Image Understanding)",
        "type": "code",
        "content": "import base64\n\nwith open(\"image.jpg\", \"rb\") as f:\n    image_data = base64.b64encode(f.read()).decode()\n\nresponse = client.messages.create(\n    model=\"claude-opus-4-6\",\n    max_tokens=1024,\n    messages=[{\n        \"role\": \"user\",\n        \"content\": [\n            {\n                \"type\": \"image\",\n                \"source\": {\n                    \"type\": \"base64\",\n                    \"media_type\": \"image/jpeg\",\n                    \"data\": image_data\n                }\n            },\n            {\"type\": \"text\", \"text\": \"Describe this image in detail\"}\n        ]\n    }]\n)"
      },
      {
        "title": "Model Selection Guide",
        "type": "table",
        "content": "claude-opus-4-6 | Most powerful reasoning | $15/$75 per 1M | Complex analysis / creative writing\nclaude-sonnet-4-6 | Best value | $3/$15 per 1M | Recommended for daily development\nclaude-haiku-4-5 | Fastest & cheapest | $0.25/$1.25 per 1M | Simple tasks / high concurrency"
      }
    ]
  },
  {
    "id": "stable-diffusion-api-guide",
    "title": "Stable Diffusion WebUI API Integration",
    "category": "api",
    "tool": "Stable Diffusion",
    "tags": ["API", "Python", "Local Deployment", "Automation"],
    "summary": "Call the Stable Diffusion WebUI via REST API for batch image generation, ControlNet, model switching, and automation.",
    "icon": "settings_ethernet",
    "difficulty": "advanced",
    "readTime": "20 min",
    "sections": [
      {
        "title": "Enable API Mode",
        "type": "steps",
        "content": "1. Edit webui-user.bat (Windows)\n   set COMMANDLINE_ARGS=--api --listen\n\n2. After starting WebUI, view API docs at:\n   http://localhost:7860/docs\n\n3. Verify the API is available:\n   curl http://localhost:7860/sdapi/v1/sd-models"
      },
      {
        "title": "Text-to-Image (txt2img)",
        "type": "code",
        "content": "import requests, base64\n\nurl = \"http://localhost:7860/sdapi/v1/txt2img\"\npayload = {\n    \"prompt\": \"a beautiful mountain landscape, golden hour, 8k\",\n    \"negative_prompt\": \"blurry, low quality, watermark\",\n    \"steps\": 25,\n    \"width\": 768,\n    \"height\": 512,\n    \"cfg_scale\": 7.5,\n    \"sampler_name\": \"DPM++ 2M Karras\"\n}\n\nresponse = requests.post(url, json=payload)\nfor i, img in enumerate(response.json()[\"images\"]):\n    with open(f\"output_{i}.png\", \"wb\") as f:\n        f.write(base64.b64decode(img))\nprint(\"Done!\")"
      },
      {
        "title": "Image-to-Image (img2img)",
        "type": "code",
        "content": "with open(\"input.png\", \"rb\") as f:\n    input_b64 = base64.b64encode(f.read()).decode()\n\npayload = {\n    \"init_images\": [input_b64],\n    \"prompt\": \"oil painting style, detailed brushwork\",\n    \"denoising_strength\": 0.65,  # 0=no change, 1=full redraw\n    \"steps\": 20\n}\nresponse = requests.post(\n    \"http://localhost:7860/sdapi/v1/img2img\", json=payload\n)"
      },
      {
        "title": "ControlNet API",
        "type": "code",
        "content": "payload = {\n    \"prompt\": \"a person dancing, vibrant colors\",\n    \"alwayson_scripts\": {\n        \"controlnet\": {\n            \"args\": [{\n                \"input_image\": base64_pose_image,\n                \"module\": \"openpose\",\n                \"model\": \"control_v11p_sd15_openpose\",\n                \"weight\": 1.0,\n                \"guidance_start\": 0.0,\n                \"guidance_end\": 1.0\n            }]\n        }\n    }\n}"
      }
    ]
  },
  {
    "id": "prompt-engineering-templates",
    "title": "Prompt Engineering Template Library",
    "category": "template",
    "tool": "General",
    "tags": ["Prompts", "Templates", "ChatGPT", "Claude"],
    "summary": "Effective prompt templates for writing, analysis, coding, and marketing — verified and ready to copy-paste.",
    "icon": "edit_note",
    "difficulty": "beginner",
    "readTime": "8 min",
    "sections": [
      {
        "title": "Role-Setting Templates",
        "type": "template",
        "content": "【Expert Advisor】\nYou are an expert in [field] with 20 years of experience. Answer in professional but accessible language — lead with the core conclusion, explain the reasoning, then provide specific actionable advice.\n\n【Critical Review】\nAs a strict critic, review the following content. Identify all potential issues, logical flaws, data problems, and areas for improvement. Be blunt:\n[content]\n\n【Socratic Guide】\nDo not give direct answers. Guide me to the solution through questions, starting from the most fundamental ones."
      },
      {
        "title": "Writing Assistant Templates",
        "type": "template",
        "content": "【Article Polish】\nImprove the following article: ① preserve original meaning ② improve readability ③ strengthen argument persuasiveness ④ fix grammar ⑤ make the opening more compelling.\nOriginal: [article]\n\n【Style Rewrite】\nRewrite the following content in a [formal / casual / academic / marketing] style. Target audience: [audience]. Keep it under [word count] words:\n[original text]\n\n【Headline Generator】\nGenerate 10 different headlines for the following content (include numeric, question, suspense, and benefit-driven styles). Label each with its best-fit platform:\n[content summary]"
      },
      {
        "title": "Research & Analysis Templates",
        "type": "template",
        "content": "【Competitor Analysis】\nCompare [A] and [B] across: feature completeness, pricing strategy, target users, core strengths, notable weaknesses, and market positioning. Present as a table with a final recommendation.\n\n【Data Interpretation】\nAnalyze the following data. Identify: ① key trends ② outliers and likely causes ③ comparison with industry benchmarks ④ recommended actions:\n[data]\n\n【SWOT Analysis】\nConduct a full SWOT analysis for [company / product / project]. List 5 specific points for each dimension, then provide strategic recommendations."
      },
      {
        "title": "Coding Assistant Templates",
        "type": "template",
        "content": "【Code Review】\nReview the following code. Check for: ① potential bugs ② performance bottlenecks ③ security vulnerabilities ④ readability issues ⑤ best practice violations. Provide specific suggestions and improved code:\n[code]\n\n【Feature Implementation】\nImplement the following in [language]: [feature description]. Requirements: include comments, handle edge cases, include usage examples, follow [language] best practices.\n\n【Debug Assistant】\nError: [error message]\nCode: [code]\nAlready tried: [attempted solutions]\nAnalyze the root cause and provide a fix. If there are multiple approaches, explain the trade-offs."
      },
      {
        "title": "Marketing Copy Templates",
        "type": "template",
        "content": "【Product Description】\nWrite a 150-word product description for [product name]. Highlight 3 core selling points: [point 1], [point 2], [point 3]. Target user: [persona]. Tone should be [professional / friendly / exciting].\n\n【Social Media Posts】\nWrite 5 social media posts for the following product / campaign. Include appropriate emoji, keep each under 100 words, and add 5 relevant hashtags:\n[product / campaign description]\n\n【Marketing Email】\nWrite a marketing email: subject line (A/B versions), opening, core value proposition, social proof, and CTA. Product: [product]. Offer: [offer details]."
      }
    ]
  },
  {
    "id": "sd-prompt-templates",
    "title": "Stable Diffusion Prompt Template Library",
    "category": "template",
    "tool": "Stable Diffusion",
    "tags": ["Templates", "Prompts", "Image Styles"],
    "summary": "40+ proven SD prompt templates for portraits, landscapes, product shots, and concept art — with universal negative prompts.",
    "icon": "palette",
    "difficulty": "beginner",
    "readTime": "10 min",
    "sections": [
      {
        "title": "Portrait Photography Templates",
        "type": "template",
        "content": "【Professional Portrait】\nportrait of [description], professional photography, studio lighting, sharp focus, 85mm lens, shallow depth of field, 8k uhd, photorealistic\n\n【Environmental Portrait】\n[person description] in [scene], natural lighting, candid photography, lifestyle, bokeh background, film grain, Fujifilm XT4\n\n【Artistic Portrait】\nportrait of [description], oil painting, renaissance style, dramatic chiaroscuro lighting, museum quality, detailed brushwork\n\n【Cyberpunk Portrait】\n[person description], cyberpunk aesthetic, neon lights, rain-soaked streets, futuristic city background, cinematic, volumetric fog"
      },
      {
        "title": "Landscape & Scene Templates",
        "type": "template",
        "content": "【Nature Photography】\n[scene description], golden hour, volumetric lighting, ultra detailed, landscape photography, award winning, National Geographic\n\n【Fantasy Scene】\n[scene description], fantasy art, magical atmosphere, ethereal lighting, concept art, artstation trending, epic scale\n\n【City at Night】\n[city description], blue hour, long exposure, light trails, HDR, ultra wide angle, architectural photography, Sony A7R\n\n【Minimalist Style】\n[subject], minimalist composition, negative space, clean background, simple elegant, studio lighting"
      },
      {
        "title": "Product Photography Templates",
        "type": "template",
        "content": "【White Background Product】\n[product name], product photography, pure white background, studio lighting, commercial photography, high detail, sharp focus\n\n【Lifestyle Product】\n[product] in [usage scene], lifestyle photography, natural lighting, shallow depth of field, premium feel\n\n【Luxury Style】\n[product], luxury product photography, dark dramatic background, rim lighting, gold accents, premium brand aesthetic\n\n【Floating Display】\n[product] floating on [background], levitation product shot, dramatic shadows, clean composition"
      },
      {
        "title": "Universal Negative Prompts",
        "type": "code",
        "content": "# Paste into the Negative Prompt field\nblurry, low quality, worst quality, low resolution, distorted, deformed, ugly, bad anatomy, watermark, signature, text, logo, cropped, out of frame, duplicate, extra limbs, mutation, poorly drawn face, bad proportions, grainy, noise, overexposed, underexposed, cartoon, anime (add this last part only when you want realistic style)"
      }
    ]
  },
  {
    "id": "runway-gen3-inspiration",
    "title": "Runway Gen-3 Video Creation Inspiration",
    "category": "inspiration",
    "tool": "Runway",
    "tags": ["Video", "Inspiration", "Gen-3", "Camera Moves"],
    "summary": "Curated Runway Gen-3 shot examples with full prompts, parameter settings, and creative notes — ready to use.",
    "icon": "movie",
    "difficulty": "intermediate",
    "readTime": "12 min",
    "sections": [
      {
        "title": "Cinematic Shots",
        "type": "template",
        "content": "【City Time-lapse】\nAerial view of a bustling city at night, time-lapse, neon lights reflecting on wet streets, cinematic 4K\nParams: Duration 10s | Motion: Slow zoom out\n\n【Character Close-up】\nExtreme close-up of a woman's eye, tear slowly forming and falling, dramatic side lighting, film noir, 35mm\nParams: Duration 5s | Camera: Static\n\n【Epic Wide Shot】\nWide establishing shot of ancient stone ruins at sunset, silhouetted adventurer, golden dust particles, cinematic widescreen\nParams: Duration 8s | Motion: Slow dolly forward"
      },
      {
        "title": "Nature Scenes",
        "type": "template",
        "content": "【Ocean Slow Motion】\nMassive ocean waves crashing against rocky cliffs in slow motion, golden sunset, sea spray catching light, photorealistic, 8K\nParams: Duration 8s | Motion: Slow\n\n【Forest Morning Mist】\nAncient redwood forest at dawn, mist rolling through trees, rays of golden light filtering through canopy, peaceful, nature documentary\nParams: Duration 10s | Camera: Slow pan right\n\n【Night Sky Star Trails】\nTime-lapse of star trails over a mountain peak, Milky Way visible, cold blue tones, 4K astrophotography\nParams: Duration 10s | Camera: Static"
      },
      {
        "title": "Abstract & Creative",
        "type": "template",
        "content": "【Fluid Art】\nAbstract fluid art, vibrant neon colors merging and flowing, macro photography style, smooth hypnotic motion, satisfying\nParams: Duration 8s | Motion: Smooth\n\n【Particle Formation】\nThousands of golden particles swirling and forming a human silhouette, dark background, magical energy, cinematic lighting\nParams: Duration 8s | Motion: Dynamic\n\n【Geometric Transformation】\nSleek geometric shapes morphing and transforming, chrome and glass materials, studio lighting, product visualization style\nParams: Duration 6s | Motion: Smooth"
      },
      {
        "title": "Creative Tips Summary",
        "type": "steps",
        "content": "1. Use Midjourney to generate a static keyframe first, then use Image to Video for consistency\n2. Camera motion vocabulary: pan left/right, zoom in/out, dolly forward, tilt up/down\n3. Time modifiers: slow motion, time-lapse, real-time\n4. Film style references: Wes Anderson style, Christopher Nolan style, Wong Kar-wai style\n5. Quality boosters: cinematic, 4K, photorealistic, film grain, anamorphic lens\n6. Avoid overly complex scene descriptions — simple and clear prompts produce more stable results"
      }
    ]
  },
  {
    "id": "elevenlabs-voice-guide",
    "title": "ElevenLabs Voice Cloning & Dubbing Guide",
    "category": "guide",
    "tool": "ElevenLabs",
    "tags": ["Voice", "TTS", "Cloning", "Dubbing"],
    "summary": "Master ElevenLabs voice cloning, text-to-speech, and API integration for podcasts, audiobooks, and video dubbing.",
    "icon": "mic",
    "difficulty": "beginner",
    "readTime": "12 min",
    "sections": [
      {
        "title": "Voice Cloning Steps",
        "type": "steps",
        "content": "1. Prepare your recording:\n   • Length: 1–3 minutes (longer = more accurate)\n   • Format: MP3/WAV, 44.1kHz or higher\n   • Environment: quiet room, no background music\n   • Content: natural speech with varied intonation and pauses\n\n2. Upload to ElevenLabs:\n   • Go to VoiceLab → Add a new voice\n   • Select Instant Voice Cloning\n   • Upload audio and enter a name\n   • Click Add Voice to finish\n\n3. Test: go to Speech Synthesis and enter text to preview"
      },
      {
        "title": "Parameter Tuning Guide",
        "type": "table",
        "content": "Stability | 0.3–0.5 | More expressive — good for storytelling / emotional content\nStability | 0.7–0.9 | More consistent — good for news / announcements\nSimilarity | 0.75–0.85 | Recommended range — similar and clear\nStyle | 0–0.3 | Slight boost to expressiveness\nSpeaker Boost | On | Further improves voice similarity"
      },
      {
        "title": "API Integration",
        "type": "code",
        "content": "pip install elevenlabs\n\nfrom elevenlabs.client import ElevenLabs\nfrom elevenlabs import save\n\nclient = ElevenLabs(api_key=\"your-api-key\")\n\naudio = client.generate(\n    text=\"Welcome to this episode. Today we're talking about AI creativity.\",\n    voice=\"your-voice-id\",  # or a built-in name like \"Rachel\"\n    model=\"eleven_multilingual_v2\"  # supports multiple languages\n)\n\nsave(audio, \"output.mp3\")\nprint(\"Audio saved\")"
      },
      {
        "title": "Use-Case Best Practices",
        "type": "steps",
        "content": "Podcast Production:\n• Use a cloned voice to generate ad-break segments\n• Batch-generate multilingual versions (11 languages supported)\n• Export MP3, then fine-edit in Descript\n\nAudiobooks:\n• Use different cloned voices for different characters\n• Keep parameters consistent across chapters for uniformity\n• Use Projects to manage multi-chapter content\n\nVideo Dubbing:\n• Generate the voiceover first, then adjust video pacing to match\n• Use subtitle files to help with alignment\n• Choose the right export format (WAV recommended for video dubbing)"
      }
    ]
  },
  {
    "id": "suno-music-guide",
    "title": "Suno AI Music Creation Complete Guide",
    "category": "guide",
    "tool": "Suno",
    "tags": ["Music", "AI Creation", "Lyrics", "Style"],
    "summary": "Create full songs with Suno AI — style descriptions, lyric structure tags, Extend for continuation, and commercial licensing notes.",
    "icon": "music_note",
    "difficulty": "beginner",
    "readTime": "10 min",
    "sections": [
      {
        "title": "Two Ways to Create",
        "type": "steps",
        "content": "Method 1: Description-based (recommended for beginners)\nEnter a description in the Style of Music field, e.g.:\n\"upbeat pop song, female vocals, piano and guitar, happy summer vibes\"\nSuno auto-generates lyrics and music\n\nMethod 2: Custom lyrics\n1. Click Customize to enable custom mode\n2. Enter complete lyrics (supports structure tags)\n3. Describe the music style in the Style field\n4. Optionally add a song title\n5. Click Create to generate"
      },
      {
        "title": "Lyric Structure Tags",
        "type": "code",
        "content": "# Use square brackets to mark song structure\n\n[Intro]          Introduction (usually no vocals or humming)\n[Verse]          Verse\n[Pre-Chorus]     Pre-chorus (bridge to chorus)\n[Chorus]         Chorus (most important — will repeat)\n[Bridge]         Bridge (appears once)\n[Outro]          Outro / ending\n[Break]          Instrumental break\n\n# Recommended song structure\n[Intro]\n[Verse]\nVerse lyrics...\n[Chorus]\nChorus lyrics...\n[Verse]\nSecond verse lyrics...\n[Chorus]\n[Bridge]\nBridge lyrics...\n[Chorus]\n[Outro]"
      },
      {
        "title": "Style Description Keywords",
        "type": "table",
        "content": "Pop | pop, indie pop, synth-pop, bedroom pop, K-pop\nRock | rock, indie rock, alternative, punk, metal\nElectronic | electronic, EDM, house, lo-fi, ambient, chillwave\nHip-Hop | hip-hop, rap, trap, boom bap, drill\nClassical | orchestral, classical, cinematic, piano, strings\nWorld Music | jazz, blues, folk, bossa nova, reggae, latin"
      },
      {
        "title": "Advanced Tips",
        "type": "steps",
        "content": "1. Extend: after generating, click ... → Extend to continue the song from any point\n2. Remaster: upgrade audio quality of older songs\n3. Covers: upload a reference audio to let AI learn a specific style\n4. Commercial rights: Pro plan and above can be used commercially (check latest terms)\n5. Stems separation: paid users can download vocal / instrumental split versions\n6. Rapid iteration: generate multiple versions from the same prompt and Extend the best one"
      }
    ]
  },
  {
    "id": "aigc-workflow-inspiration",
    "title": "AIGC Creative Workflow Inspiration Collection",
    "category": "inspiration",
    "tool": "Multi-tool",
    "tags": ["Workflow", "Inspiration", "All-in-one", "Efficiency"],
    "summary": "10 proven end-to-end AIGC workflows — full pipelines from content planning to final delivery.",
    "icon": "account_tree",
    "difficulty": "intermediate",
    "readTime": "15 min",
    "sections": [
      {
        "title": "Short-Form Video Workflow",
        "type": "steps",
        "content": "Tool chain: ChatGPT → Midjourney → Runway → ElevenLabs → CapCut\n\n1. ChatGPT: input topic, generate script + storyboard descriptions (10–15 scenes)\n2. Midjourney: generate keyframe images from storyboard descriptions\n3. Runway Gen-3: convert images into 3–8 second video clips\n4. ElevenLabs: convert script to voiceover MP3\n5. CapCut: import all assets, edit and compose, add subtitles\n\nBest for: educational content, product demos, storytelling\nEstimated time: 3–5 hours (1–2 hours once proficient)"
      },
      {
        "title": "Brand Visual Workflow",
        "type": "steps",
        "content": "Tool chain: Claude → Midjourney → Adobe Firefly → Canva\n\n1. Claude: analyze brand positioning, generate 3 alternative visual directions\n2. Midjourney: generate 10+ style exploration images for each direction\n3. Adobe Firefly: generate brand assets in the chosen style (consistency guaranteed)\n4. Canva: produce materials in multiple sizes (posters, business cards, social media covers)\n\nBest for: brand design, marketing collateral, social media\nKey advantage: Firefly is commercially safe — no copyright risk"
      },
      {
        "title": "Podcast Production Workflow",
        "type": "steps",
        "content": "Tool chain: Perplexity → Claude → ElevenLabs → Descript\n\n1. Perplexity: research the topic, collect the latest viewpoints and data\n2. Claude: write the podcast script (intro, body, outro)\n3. ElevenLabs: generate AI voiceover (or upload real recording)\n4. Descript: one-click noise reduction, trim silences, generate subtitle file\n\nBest for: knowledge podcasts, news commentary, educational audio\nOutput: MP3 audio + SRT subtitles + cover art"
      },
      {
        "title": "E-commerce Content Workflow",
        "type": "steps",
        "content": "Tool chain: ChatGPT → Stable Diffusion → Remove.bg → Canva\n\n1. ChatGPT: generate product selling points copy + 5 scene descriptions\n2. Stable Diffusion: generate product showcase images in each scene\n3. Remove.bg: auto background removal\n4. Canva: create main images, carousel detail pages, promotional banners\n\nBest for: e-commerce operations, product display, promotions\nCost estimate: SD local deployment is nearly free — saves 80%+ vs outsourced photography"
      }
    ]
  },
  {
    "id": "comfyui-workflow-guide",
    "title": "ComfyUI Workflow Usage Guide",
    "category": "guide",
    "tool": "ComfyUI",
    "tags": ["ComfyUI", "Workflow", "Automation", "Advanced"],
    "summary": "Master the ComfyUI node editor — load workflows, connect nodes, batch generation, and top workflow recommendations.",
    "icon": "hub",
    "difficulty": "advanced",
    "readTime": "18 min",
    "sections": [
      {
        "title": "Installation & Launch",
        "type": "steps",
        "content": "1. Install Python 3.10+ and Git\n2. Clone the repo:\n   git clone https://github.com/comfyanonymous/ComfyUI\n   cd ComfyUI\n\n3. Install dependencies:\n   pip install -r requirements.txt\n\n4. Place models in models/checkpoints/\n\n5. Launch:\n   python main.py\n   Open http://127.0.0.1:8188"
      },
      {
        "title": "Core Concepts",
        "type": "steps",
        "content": "Node: each processing step is a node, for example:\n• Load Checkpoint — load the model\n• CLIPTextEncode — encode the prompt\n• KSampler — diffusion sampling (core node)\n• VAE Decode — decode to image\n• Save Image — save the result\n\nWires: connect node outputs to the next node's inputs\nQueue: click Queue Prompt on the right to submit a generation job\nWorkflow: the entire node graph can be exported as a JSON file for sharing"
      },
      {
        "title": "Recommended Extensions",
        "type": "table",
        "content": "ComfyUI Manager | Extension manager — install this first | Search ltdrdata/ComfyUI-Manager on GitHub\nWAS Node Suite | 150+ utility nodes | WASasquatch/was-node-suite-comfyui\nIPAdapter Plus | Style transfer / face consistency | cubiq/ComfyUI_IPAdapter_plus\nControlNet | Pose / line-art control | Fannovel16/comfyui_controlnet_aux\nUltimate SD Upscale | High-res upscaling | ssitu/ComfyUI_UltimateSDUpscale"
      },
      {
        "title": "Workflow Resources",
        "type": "steps",
        "content": "Where to find quality workflows:\n\n1. OpenArt.ai/workflows — largest workflow sharing community\n2. Civitai.com — model pages that include workflows\n3. Reddit r/comfyui — community shares\n4. GitHub Awesome ComfyUI — curated workflow lists\n\nHow to use:\n• Download the .json file\n• Drag it into ComfyUI or use the Load button to import\n• Install any missing nodes (Manager will prompt you)\n• Update model paths to match your local setup"
      }
    ]
  },
  {
    "id": "perplexity-research-guide",
    "title": "Perplexity AI Efficient Research Workflow",
    "category": "guide",
    "tool": "Perplexity",
    "tags": ["Search", "Research", "Information", "Efficiency"],
    "summary": "Use Perplexity AI as a replacement for traditional search — get accurate, cited answers fast for research, topic selection, and competitor analysis.",
    "icon": "search",
    "difficulty": "beginner",
    "readTime": "8 min",
    "sections": [
      {
        "title": "Core Features & Use Cases",
        "type": "steps",
        "content": "What makes Perplexity unique:\n• Real-time web search + AI-synthesized answers\n• Every claim cites a source you can verify\n• Supports follow-up questions and multi-turn conversations\n• Focus modes let you target specific search scopes\n\nBest use cases:\n• Industry research and market analysis\n• Quickly understanding unfamiliar topics\n• Fact-checking claims\n• Gathering competitor information\n• Finding trending angles for content topics"
      },
      {
        "title": "Effective Prompting Techniques",
        "type": "template",
        "content": "【Market Research】\nAnalyze the current state of [industry / product]: market size, growth rate, key players, recent trends, and user pain points. Cite the latest data.\n\n【Competitor Research】\nCompare [Product A] and [Product B] on pricing, features, user reviews, and pros/cons. Summarize as a table.\n\n【Technical Research】\nHow does [technology] work? What are the current best practices? What are the leading open-source implementations?\n\n【Topic Ideation】\nRegarding [topic], what notable developments have occurred in the past 3 months? What angles might readers find most interesting?"
      },
      {
        "title": "Focus Mode Guide",
        "type": "table",
        "content": "All | Default mode | Search the entire web\nAcademic | Academic research | Prioritizes academic papers and studies\nYouTube | Video research | Searches and summarizes YouTube videos\nReddit | Community opinions | Gets real user discussions and reviews\nWolfram Alpha | Math / calculation | Precise mathematical and scientific computation"
      },
      {
        "title": "Combining with Other Tools",
        "type": "steps",
        "content": "Research workflow:\n1. Perplexity: quickly research the topic, collect key info and sources\n2. Open original source links to verify important data\n3. Claude / ChatGPT: write a structured report from the collected information\n4. Notion AI: organize into a knowledge base and add personal insights\n\nContent creation workflow:\n1. Perplexity: search the topic + collect the latest viewpoints\n2. Identify a unique angle and structure\n3. Claude: write the full article\n4. Perplexity: fact-check key data"
      }
    ]
  }
]};
