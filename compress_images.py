#!/usr/bin/env python3
"""
파트너 로고 이미지 무손실 압축 스크립트
"""

import os
from PIL import Image
import glob

def compress_images(input_folder, quality=85):
    """PNG 이미지들을 무손실 압축"""
    
    png_files = glob.glob(os.path.join(input_folder, "*.png"))
    
    print(f"🖼️ {len(png_files)}개 이미지 압축 시작...")
    
    total_original = 0
    total_compressed = 0
    
    for file_path in png_files:
        try:
            # 원본 파일 크기
            original_size = os.path.getsize(file_path)
            total_original += original_size
            
            # 이미지 열기
            with Image.open(file_path) as img:
                # RGBA 모드로 변환 (투명도 유지)
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                # 임시 파일로 저장
                temp_path = file_path + ".temp"
                img.save(temp_path, "PNG", optimize=True, quality=quality)
                
                # 압축된 파일 크기
                compressed_size = os.path.getsize(temp_path)
                
                # 크기가 줄어들었으면 교체, 아니면 원본 유지
                if compressed_size < original_size:
                    os.replace(temp_path, file_path)
                    total_compressed += compressed_size
                    reduction = (1 - compressed_size/original_size) * 100
                    print(f"✅ {os.path.basename(file_path)}: {original_size:,} → {compressed_size:,} bytes ({reduction:.1f}% 감소)")
                else:
                    os.remove(temp_path)
                    total_compressed += original_size
                    print(f"⚪ {os.path.basename(file_path)}: 이미 최적화됨")
                    
        except Exception as e:
            print(f"❌ {os.path.basename(file_path)}: 압축 실패 - {e}")
            total_compressed += original_size
    
    # 전체 결과 출력
    total_reduction = (1 - total_compressed/total_original) * 100 if total_original > 0 else 0
    print(f"\n📊 압축 완료!")
    print(f"원본 총 크기: {total_original:,} bytes ({total_original/1024/1024:.2f} MB)")
    print(f"압축 후 크기: {total_compressed:,} bytes ({total_compressed/1024/1024:.2f} MB)")
    print(f"총 감소량: {total_reduction:.1f}%")

if __name__ == "__main__":
    # 파트너 폴더 압축
    partners_folder = "public/partners"
    
    if os.path.exists(partners_folder):
        compress_images(partners_folder)
        
        # news-bg.png도 압축
        news_bg = "public/news-bg.png"
        if os.path.exists(news_bg):
            print(f"\n🖼️ news-bg.png 압축 중...")
            compress_images("public", quality=85)
    else:
        print(f"❌ {partners_folder} 폴더를 찾을 수 없습니다.")
        print("paiptree-website 프로젝트 루트 폴더에서 실행하세요.")
