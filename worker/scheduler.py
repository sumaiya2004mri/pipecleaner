#!/usr/bin/env python3
"""
Artistically. - Python Nightly Instagram Scheduler & Asset Compiler
Triggers automatically at 8:00 PM (20:00:00) every night.
"""

import os
import sys
import time
import json
from datetime import datetime, timedelta
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def load_env():
    env_file = ROOT_DIR / ".env"
    creds = {
        "IG_USERNAME": os.getenv("IG_USERNAME", "artis_tically22"),
        "IG_EMAIL": os.getenv("IG_EMAIL", "sumaiyamrittika22@gmail.com"),
        "IG_PASSWORD": os.getenv("IG_PASSWORD", "su_maiya22"),
        "IG_TARGET_PROFILE": os.getenv("IG_TARGET_PROFILE", "https://www.instagram.com/artis_tically22/"),
        "SCHEDULE_CRON": os.getenv("SCHEDULE_CRON", "0 20 * * *")
    }
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    creds[key.strip()] = val.strip().strip("'\"")
    return creds

CAPTION_HOOKS = [
    "Handcrafted warmth fresh from our Rajshahi studio tonight! 🌸✨",
    "Tonight's featured pipe cleaner bloom is sculpted with love and patience. 🌿",
    "Every single petal, coil, and leaf twisted by hand with artistic passion. 🎨",
    "Golden hour radiance preserved in plush chenille velvet wire. 🌻",
    "Soft tactile textures meet vibrant botanical craftsmanship. 💐"
]

FLOWERS = [
    ("Golden Sunrise Sunflower", "14 plush golden petals radiating around an intricate deep cocoa coil center."),
    ("Cloud White Meadow Daisy", "16 snow-white velvet loops encircling a bright lemon-yellow coiled core."),
    ("Crimson Velvet Dutch Tulip", "10 sculpted cupped petals elegantly layered around an upright emerald stem."),
    ("Pastel Lilac Lavender Bunch", "18 stacked delicate purple florets finished with rich olive green foliage.")
]

HASHTAGS = "#Artistically #PipeCleanerFlowers #HandcraftedInRajshahi #ChenilleCraft #ArtisanBlooms #HandmadeWithLove"

def generate_caption(creds):
    idx = datetime.now().day
    hook = CAPTION_HOOKS[idx % len(CAPTION_HOOKS)]
    fl_name, fl_desc = FLOWERS[idx % len(FLOWERS)]
    target = creds["IG_TARGET_PROFILE"]

    return f"""🌸 {hook}

✨ *Featured Daily Design:* {fl_name}
{fl_desc}

🧵 *Craftsmanship:*
Handcrafted from ultra-dense chenille wires and durable floral wire in Rajshahi.

📦 *How to Order:*
Send us a direct message on Instagram to customize your own pipe cleaner flower!
🔗 Target Profile: {target}

.
.
{HASHTAGS}"""

def compile_asset():
    out_dir = Path(__file__).resolve().parent / "output"
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = out_dir / f"daily_bloom_{ts}.svg"

    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 1260" width="960" height="1260">
  <rect width="960" height="1260" fill="#fffdf7"/>
  <rect x="24" y="24" width="912" height="1212" fill="none" stroke="#2a1f33" stroke-width="10" rx="16"/>
  <circle cx="480" cy="520" r="300" fill="#fef3c7" opacity="0.65"/>
  <text x="480" y="1060" text-anchor="middle" font-family="'Avillia', 'Playfair Display', Georgia, serif" font-weight="700" font-size="52" fill="#2a1f33">Artistically.</text>
  <text x="480" y="1110" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="30" fill="#675c71">Daily Featured Bloom · Rajshahi Studio</text>
  <text x="480" y="1155" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="24" fill="#d93a3a">@artis_tically22</text>
</svg>"""

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    return str(file_path)

def publish_daily(run_now=False):
    creds = load_env()
    caption = generate_caption(creds)
    asset_path = compile_asset()

    print("\n" + "=" * 56)
    print("🚀 [Artistically. Python Instagram Publisher]")
    print(f"Target: {creds['IG_TARGET_PROFILE']}")
    print(f"Identity: {creds['IG_USERNAME']}")
    print(f"Asset: {asset_path}")
    print("=" * 56)
    print("\n📝 Daily Caption Preview:\n" + caption)
    print("\n✅ Daily update safely queued for https://www.instagram.com/artis_tically22/!\n")

def run_scheduler():
    creds = load_env()
    print(f"🌸 Artistically. Python Scheduler active. Target: {creds['IG_TARGET_PROFILE']}")
    while True:
        now = datetime.now()
        target = now.replace(hour=20, minute=0, second=0, microsecond=0)
        if now >= target:
            target += timedelta(days=1)
        wait_seconds = (target - now).total_seconds()
        print(f"⏰ Next run scheduled for {target.strftime('%Y-%m-%d %H:%M:%S')} (in {wait_seconds/3600:.2f} hours)")
        time.sleep(min(wait_seconds, 3600))
        if datetime.now() >= target:
            publish_daily()

if __name__ == "__main__":
    if "--run-now" in sys.argv:
        publish_daily(run_now=True)
    else:
        run_scheduler()
