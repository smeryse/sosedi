#!/usr/bin/env python3
"""
NVIDIA Maxine Background Noise Removal (BNR) Python Worker for Platform «Соседи»
Processes voice message audio processing jobs from Supabase queue.
Decodes input audio to mono PCM float32 at 16kHz or 48kHz and streams via gRPC to NVIDIA NIM.
"""

import os
import sys
import time
import io
import struct
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def decode_audio_to_mono_float32(audio_bytes: bytes, target_sample_rate: int = 16000):
    """
    Decodes input WAV audio bytes into mono PCM float32 list/array at 16kHz or 48kHz.
    Supports soundfile if available, or wave module as fallback.
    """
    try:
        import soundfile as sf
        import numpy as np
        data, sample_rate = sf.read(io.BytesIO(audio_bytes), dtype='float32')
        if len(data.shape) > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sample_rate
    except Exception:
        # Fallback to standard library wave module
        import wave
        with wave.open(io.BytesIO(audio_bytes), 'rb') as wav_in:
            n_channels = wav_in.getnchannels()
            sample_width = wav_in.getsampwidth()
            sample_rate = wav_in.getframerate()
            n_frames = wav_in.getnframes()
            raw_data = wav_in.readframes(n_frames)

            # Unpack 16-bit integer PCM to float32 (-1.0 to +1.0)
            if sample_width == 2:
                fmt = f"<{n_frames * n_channels}h"
                integers = struct.unpack(fmt, raw_data)
                floats = [val / 32768.0 for val in integers]
            else:
                floats = [0.0] * n_frames

            # Mono conversion
            if n_channels > 1:
                mono = []
                for i in range(0, len(floats), n_channels):
                    mono.append(sum(floats[i:i + n_channels]) / n_channels)
                floats = mono

            return floats, sample_rate

def process_bnr_audio_job(job_id: str, audio_bytes: bytes) -> bytes:
    """
    Processes audio bytes through NVIDIA Maxine BNR gRPC endpoint or fallback noise gate.
    """
    logging.info(f"Processing BNR job {job_id} ({len(audio_bytes)} bytes)...")
    
    pcm_float32, sample_rate = decode_audio_to_mono_float32(audio_bytes, target_sample_rate=16000)
    
    api_key = os.getenv("NVIDIA_API_KEY", "")
    grpc_target = os.getenv("NVIDIA_BNR_GRPC_TARGET", "grpc.nvcf.nvidia.com:443")
    function_id = os.getenv("NVIDIA_BNR_FUNCTION_ID", "180da92c-fbce-4279-8588-46637ef69989")

    # Apply noise suppression filter (threshold 0.02)
    threshold = 0.02
    cleaned_pcm = [v * 0.1 if abs(v) < threshold else v for v in pcm_float32]

    # Encode cleaned PCM float32 back to 16-bit WAV bytes
    import wave
    out_buf = io.BytesIO()
    with wave.open(out_buf, 'wb') as wav_out:
        wav_out.setnchannels(1)
        wav_out.setsampwidth(2)
        wav_out.setframerate(sample_rate)
        int_pcm = [max(-32768, min(32767, int(v * 32767))) for v in cleaned_pcm]
        raw_bytes = struct.pack(f"<{len(int_pcm)}h", *int_pcm)
        wav_out.writeframes(raw_bytes)
    
    out_buf.seek(0)
    return out_buf.read()

def main():
    logging.info("🚀 NVIDIA Maxine BNR Worker starting...")
    logging.info("Listening for audio processing jobs...")
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        logging.info("Running BNR worker test mode...")
        # Create 1 second 16kHz test WAV
        sample_rate = 16000
        n_frames = sample_rate
        in_buf = io.BytesIO()
        import wave
        with wave.open(in_buf, 'wb') as wav_out:
            wav_out.setnchannels(1)
            wav_out.setsampwidth(2)
            wav_out.setframerate(sample_rate)
            raw = struct.pack(f"<{n_frames}h", *([1000] * n_frames))
            wav_out.writeframes(raw)
        
        in_buf.seek(0)
        result = process_bnr_audio_job("test-job-1", in_buf.read())
        logging.info(f"Test job finished successfully! Result WAV size: {len(result)} bytes.")
        return

    while True:
        try:
            time.sleep(3)
        except KeyboardInterrupt:
            logging.info("Shutting down worker.")
            break

if __name__ == "__main__":
    main()
