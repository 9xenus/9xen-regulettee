// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QrScannerOverlay } from '../../src/components/trust/QrScannerOverlay';

// Polyfill HTMLMediaElement and HTMLCanvasElement for jsdom environment
if (typeof window !== 'undefined') {
  if (typeof HTMLMediaElement !== 'undefined') {
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = vi.fn();
  } else {
    (global as any).HTMLMediaElement = class {
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
    };
  }

  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
    } as any);
  }
}

describe('QrScannerOverlay Component (Vitest & Playwright mock environment)', () => {
  const mockOnClose = vi.fn();
  const mockOnScanSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.mediaDevices.getUserMedia for device permissions
    const mockMediaStream = {
      getTracks: () => [{ stop: vi.fn() }],
      getVideoTracks: () => [{ getCapabilities: () => ({ torch: true }) }]
    } as unknown as MediaStream;

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles mock device permissions properly upon opening', async () => {
    render(
      <QrScannerOverlay
        isOpen={true}
        onClose={mockOnClose}
        onScanSuccess={mockOnScanSuccess}
        title="Trust Verification Scanner"
      />
    );

    expect(screen.getByText('Trust Verification Scanner')).toBeInTheDocument();

    // Verify that device camera permissions (getUserMedia) were successfully requested
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: expect.objectContaining({ facingMode: expect.any(Object) }),
        audio: false,
      });
    });
  });

  it('correctly triggers onScanSuccess callback when provided with valid QR data', async () => {
    render(
      <QrScannerOverlay
        isOpen={true}
        onClose={mockOnClose}
        onScanSuccess={mockOnScanSuccess}
      />
    );

    // Wait for camera initialization
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    const trustElements = screen.getAllByText(/TB-BD-2026-98101/i);
    const demoButton = trustElements[0].closest('button');
    expect(demoButton).toBeInTheDocument();

    fireEvent.click(demoButton!);

    // Verify that onScanSuccess callback was triggered with the clean scanned data and detected type
    await waitFor(() => {
      expect(mockOnScanSuccess).toHaveBeenCalledWith('TB-BD-2026-98101', 'qr');
    });

    // Verify auto-close behavior
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('correctly parses and triggers bKash payment QR code data', async () => {
    render(
      <QrScannerOverlay
        isOpen={true}
        onClose={mockOnClose}
        onScanSuccess={mockOnScanSuccess}
      />
    );

    const bkashElements = screen.getAllByText(/01711002233/i);
    const bkashButton = bkashElements[0].closest('button');
    expect(bkashButton).toBeInTheDocument();

    fireEvent.click(bkashButton!);

    await waitFor(() => {
      expect(mockOnScanSuccess).toHaveBeenCalledWith('01711002233', 'bkash');
    });
  });
});
