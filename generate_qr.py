#!/usr/bin/env python3
"""
Generate QR codes for MedChain drug verification testing
"""

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SquareGradiantColorMask
import base64
from io import BytesIO

def generate_qr_code(batch_number, is_counterfeit=False):
    """Generate QR code for a batch number"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(batch_number)
    qr.make(fit=True)
    
    # Use different colors for counterfeit vs safe
    if is_counterfeit:
        fill_color = '#dc2626'  # Red
        back_color = '#fef2f2'  # Light red
    else:
        fill_color = '#16a34a'  # Green
        back_color = '#f0f9ff'  # Light green
    
    img = qr.make_image(fill_color=fill_color, back_color=back_color)
    
    # Convert to base64 for web display
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def main():
    # Test samples
    samples = [
        ("EPI-2024-001", True, "Epinephrine", "COUNTERFEIT"),
        ("INS-2024-026", False, "Insulin", "GENUINE"),
        ("MOR-2024-041", False, "Morphine", "GENUINE"),
        ("DIG-2024-051", False, "Digoxin", "GENUINE"),
        ("ATR-2024-015", False, "Atropine", "GENUINE"),
    ]
    
    print("MedChain QR Code Generator")
    print("=" * 40)
    
    for batch, is_counterfeit, drug_name, status in samples:
        print(f"\n{drug_name} ({batch}) - {status}")
        print("-" * 30)
        qr_data = generate_qr_code(batch, is_counterfeit)
        print(f"QR Code (Base64): {qr_data[:50]}...")
        print(f"Batch Number: {batch}")
        print(f"Status: {'COUNTERFEIT' if is_counterfeit else 'GENUINE'}")
        
        # Save individual QR code files
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(batch)
        qr.make(fit=True)
        
        fill_color = '#dc2626' if is_counterfeit else '#16a34a'
        back_color = '#ffffff'
        
        img = qr.make_image(fill_color=fill_color, back_color=back_color)
        filename = f"qr_{batch.replace('-', '_')}.png"
        img.save(filename)
        print(f"Saved: {filename}")

if __name__ == "__main__":
    main()