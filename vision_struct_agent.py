from __future__ import annotations
from typing import Any, Dict, Optional, List, Literal
from pydantic import BaseModel, Field
from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
import base64
import uuid
import json

# ==========================
# 1. SYSTEM PROMPT TEMPLATE
# ==========================

VISION_TO_JSON_SYSTEM_PROMPT = """
Name: Vision-to-JSON

Description: It will help me to write JSON prompts from images/visuals.

Instructions:

ROLE & OBJECTIVE
You are VisionStruct, an advanced Computer Vision & Data Serialization Engine. Your sole purpose is to ingest visual input (images) and transcode every discernible visual element—both macro and micro—into a rigorous, machine-readable JSON format.

CORE DIRECTIVE
Do not summarize. Do not offer high-level overviews unless nested within the global context. Capture 100% of the visual data available in the image. If a detail exists in pixels, it must exist in your JSON output. You are not describing art; you are creating a database record of reality.

ANALYSIS PROTOCOL
Before generating the final JSON, perform a silent “Visual Sweep” (do not output this):
1. Macro Sweep: Identify the scene type, global lighting, atmosphere, primary subjects.
2. Micro Sweep: Scan for textures, imperfections, background clutter, reflections, shadow gradients, and text (OCR).
3. Relationship Sweep: Map spatial and semantic relationships (e.g., “holding,” “obscuring,” “next to”).

OUTPUT FORMAT (STRICT)
Return ONLY one valid JSON object. No markdown fencing, no commentary. Use this schema, expanding arrays as required:

{
  "meta": {
    "image_quality": "Low/Medium/High",
    "image_type": "Photo/Illustration/Diagram/Screenshot/etc",
    "resolution_estimation": "Approximate resolution if discernable"
  },
  "global_context": {
    "scene_description": "A comprehensive, objective paragraph describing the entire scene.",
    "time_of_day": "Specific time or lighting condition",
    "weather_atmosphere": "Foggy/Clear/Rainy/Chaotic/Serene",
    "lighting": {
      "source": "Sunlight/Artificial/Mixed",
      "direction": "Top-down/Backlit/etc",
      "quality": "Hard/Soft/Diffused",
      "color_temp": "Warm/Cool/Neutral"
    }
  },
  "color_palette": {
    "dominant_hex_estimates": ["#RRGGBB", "#RRGGBB"],
    "accent_colors": ["Color name 1", "Color name 2"],
    "contrast_level": "High/Low/Medium"
  },
  "composition": {
    "camera_angle": "Eye-level/High-angle/Low-angle/Macro",
    "framing": "Close-up/Wide-shot/Medium-shot",
    "depth_of_field": "Shallow/Deep",
    "focal_point": "Primary element drawing the eye"
  },
  "objects": [
    {
      "id": "obj_001",
      "label": "Primary Object Name",
      "category": "Person/Vehicle/Furniture/etc",
      "location": "Center/Top-Left/etc",
      "prominence": "Foreground/Background",
      "visual_attributes": {
        "color": "Detailed color description",
        "texture": "Rough/Smooth/Metallic/Fabric-type",
        "material": "Wood/Plastic/Skin/etc",
        "state": "Damaged/New/Wet/Dirty",
        "dimensions_relative": "Large relative to frame"
      },
      "micro_details": [
        "Scuff mark on left corner",
        "Stitching pattern visible on hem",
        "Reflection of window in surface",
        "Dust particles visible"
      ],
      "pose_or_orientation": "Standing/Tilted/Facing away",
      "text_content": "null or specific text"
    }
  ],
  "text_ocr": {
    "present": true,
    "content": [
      {
        "text": "Exact text",
        "location": "Sign/T-shirt/Screen/etc",
        "font_style": "Serif/Handwritten/Bold",
        "legibility": "Clear/Partially obscured"
      }
    ]
  },
  "semantic_relationships": [
    "Object A is supporting Object B",
    "Object C is casting a shadow on Object A",
    "Object D is visually similar to Object E"
  ]
}

CRITICAL CONSTRAINTS
• Granularity: Never say “a crowd.” Represent each visible individual as an object or sub-object.
• Micro-Details: Capture scratches, dust, fabric folds, dirt patterns, reflections, and subtle gradients.
• Null Values: If a field does not apply, use null — never omit it.
• Completeness: Every pixel-derived detail must be captured somewhere in the JSON.

Important: You must respond with a single valid JSON object and nothing else. No markdown, no prose, no explanation. If uncertain, still return best-effort valid JSON following the schema above. If you must invent placeholder values, mark them clearly as estimates.
"""


# ======================================
# 2. SWARM MESSAGE & JOB TYPE SCHEMAS
# ======================================

SwarmMessageType = Literal[
    "vision.to_json.request",
    "vision.to_json.response",
    "vision.to_json.error",
]


class VisionJobRequest(BaseModel):
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_b64: str = Field(
        ...,
        description="Base64-encoded image bytes (PNG/JPEG/etc).",
    )
    project: Optional[str] = Field(
        default=None,
        description="Project label (e.g., 'WIRED_CHAOS_META', 'VAULT_33', 'NEURO_UNIVERSE').",
    )
    context_tags: Optional[List[str]] = Field(
        default=None,
        description="Arbitrary tags (e.g., ['thumbnail', 'nft_trait_extraction']).",
    )


class VisionJobResult(BaseModel):
    job_id: str
    success: bool
    raw_json: Dict[str, Any]
    project: Optional[str] = None
    context_tags: Optional[List[str]] = None


class SwarmEnvelope(BaseModel):
    """Generic envelope for messages moving through your Swarm bus."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: SwarmMessageType
    source_agent: str
    target_agent: str
    payload: Dict[str, Any]
    correlation_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ======================================
# 3. LLM CLIENT ABSTRACTION (GEMINI/GPT)
# ======================================


class MultiModalModelClient:
    """Abstract adapter over your actual multimodal provider (Gemini, OpenAI, etc.)."""

    def __init__(self, model_name: str):
        self.model_name = model_name

    def call_model(self, image_bytes: bytes, system_prompt: str) -> str:
        """Call your multimodal LLM here.

        The returned string MUST be a single JSON object with no markdown wrappers.
        In production, implement with a multimodal endpoint such as Google Gemini or OpenAI.
        """
        raise NotImplementedError(
            "Implement MultiModalModelClient.call_model with your provider (Gemini, etc.).",
        )


# ======================================
# 4. VISION STRUCT AGENT (SWARM PLUGGABLE)
# ======================================


class VisionStructAgent:
    """Swarm-compatible agent for Vision-to-JSON jobs."""

    def __init__(self, model_client: MultiModalModelClient, agent_name: str = "vision_struct"):
        self.model_client = model_client
        self.agent_name = agent_name

    def run_job(self, job: VisionJobRequest) -> VisionJobResult:
        try:
            image_bytes = base64.b64decode(job.image_b64)
        except Exception as exc:  # noqa: BLE001
            raise ValueError(f"Invalid base64 image: {exc}") from exc

        raw_output = self.model_client.call_model(
            image_bytes=image_bytes,
            system_prompt=VISION_TO_JSON_SYSTEM_PROMPT,
        )

        try:
            json_obj = json.loads(raw_output)
        except Exception as exc:  # noqa: BLE001
            raise ValueError(
                f"Model did not return valid JSON: {exc}\nOutput was:\n{raw_output}",
            ) from exc

        return VisionJobResult(
            job_id=job.job_id,
            success=True,
            raw_json=json_obj,
            project=job.project,
            context_tags=job.context_tags,
        )

    def handle_swarm_message(self, envelope: SwarmEnvelope) -> SwarmEnvelope:
        if envelope.type != "vision.to_json.request":
            raise ValueError(
                f"Unsupported message type for VisionStructAgent: {envelope.type}",
            )

        job = VisionJobRequest(**envelope.payload)
        try:
            result = self.run_job(job)
            response_type: SwarmMessageType = "vision.to_json.response"
            payload: Dict[str, Any] = result.model_dump()
        except Exception as exc:  # noqa: BLE001
            response_type = "vision.to_json.error"
            payload = {
                "job_id": job.job_id,
                "success": False,
                "error": str(exc),
                "project": job.project,
                "context_tags": job.context_tags,
            }

        return SwarmEnvelope(
            type=response_type,
            source_agent=self.agent_name,
            target_agent=envelope.source_agent,
            payload=payload,
            correlation_id=envelope.correlation_id or envelope.id,
            metadata={"origin_type": "vision_struct_swarm_handler"},
        )


# ======================================
# 5. FASTAPI HTTP WRAPPER (OPTIONAL)
# ======================================


app = FastAPI(title="VisionStruct Agent API", version="1.0.0")

model_client = MultiModalModelClient(model_name="YOUR_MODEL_NAME")
vision_agent = VisionStructAgent(model_client=model_client)


class HttpVisionRequest(BaseModel):
    image_b64: str
    project: Optional[str] = None
    context_tags: Optional[List[str]] = None


class HttpVisionResponse(BaseModel):
    job_id: str
    data: Dict[str, Any]


@app.post("/vision-to-json", response_model=HttpVisionResponse)
async def vision_to_json_http_endpoint(body: HttpVisionRequest):
    job = VisionJobRequest(
        image_b64=body.image_b64,
        project=body.project,
        context_tags=body.context_tags,
    )

    try:
        result = vision_agent.run_job(job)
    except NotImplementedError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return HttpVisionResponse(
        job_id=result.job_id,
        data=result.raw_json,
    )


@app.post("/vision-to-json/upload", response_model=HttpVisionResponse)
async def vision_to_json_upload(file: UploadFile = File(...), project: Optional[str] = None):
    try:
        content = await file.read()
        image_b64 = base64.b64encode(content).decode("utf-8")
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to read file: {exc}") from exc

    job = VisionJobRequest(image_b64=image_b64, project=project)
    try:
        result = vision_agent.run_job(job)
    except NotImplementedError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return HttpVisionResponse(
        job_id=result.job_id,
        data=result.raw_json,
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
