import cv2
import numpy as np
from PIL import Image
from rembg import remove, new_session
from tqdm import tqdm
import subprocess
import os
import tempfile


def remove_video_background(
    input_video,
    output_video="video_sin_fondo.mp4",
    background_color=(255, 255, 255),  # blanco RGB
    model_name="u2net"
):
    """
    Remueve el fondo de un video frame por frame y exporta un MP4
    con el sujeto sobre un color sólido.

    Nota:
    MP4 común no soporta transparencia real.
    Para transparencia se recomienda exportar secuencia PNG, WebM VP9 alpha o MOV ProRes 4444.
    """

    cap = cv2.VideoCapture(input_video)

    if not cap.isOpened():
        raise ValueError("No se pudo abrir el video de entrada.")

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    temp_video = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False).name

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(temp_video, fourcc, fps, (width, height))

    session = new_session(model_name)

    bg = np.full((height, width, 3), background_color, dtype=np.uint8)

    for _ in tqdm(range(total_frames), desc="Removiendo fondo"):
        ret, frame = cap.read()

        if not ret:
            break

        # OpenCV usa BGR, PIL usa RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(frame_rgb)

        # rembg devuelve imagen con canal alpha
        result = remove(pil_image, session=session)
        result = result.convert("RGBA")

        rgba = np.array(result)

        foreground = rgba[:, :, :3]
        alpha = rgba[:, :, 3] / 255.0
        alpha = np.stack([alpha, alpha, alpha], axis=2)

        composed = (foreground * alpha + bg * (1 - alpha)).astype(np.uint8)

        # Volver a BGR para OpenCV
        composed_bgr = cv2.cvtColor(composed, cv2.COLOR_RGB2BGR)
        writer.write(composed_bgr)

    cap.release()
    writer.release()

    # Intenta conservar audio original con ffmpeg
    try:
        subprocess.run([
            "ffmpeg", "-y",
            "-i", temp_video,
            "-i", input_video,
            "-map", "0:v:0",
            "-map", "1:a:0?",
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            output_video
        ], check=True)

        os.remove(temp_video)

    except Exception:
        os.rename(temp_video, output_video)
        print("Video exportado sin audio porque ffmpeg no estaba disponible o falló el muxing.")

    print(f"Listo: {output_video}")


remove_video_background(
    input_video="entrada.mp4",
    output_video="salida_sin_fondo.mp4",
    background_color=(255, 255, 255)
)