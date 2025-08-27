import React, { useState, useRef } from 'react';
import { AuraState } from '../types';

interface AuraButtonProps {
  state: AuraState;
  onActivate: () => void;
  onDeactivate: () => void;
  onSOSActivate: () => void;
  disabled?: boolean;
}

export const AuraButton: React.FC<AuraButtonProps> = ({
  state,
  onActivate,
  onDeactivate,
  onSOSActivate,
  disabled = false
}) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressThreshold = 2000; // 2 seconds

  const handleClick = () => {
    if (disabled) return;
    
    if (state === AuraState.IDLE) {
      onActivate();
    } else {
      onDeactivate();
    }
  };

  const handleMouseDown = () => {
    if (disabled || state === AuraState.SOS_ACTIVE) return;
    
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]); // Distinct vibration pattern
      }
      onSOSActivate();
      setIsLongPressing(false);
    }, longPressThreshold);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (isLongPressing) {
      setIsLongPressing(false);
      // Only trigger normal click if it wasn't a long press
      setTimeout(() => {
        if (!isLongPressing) {
          handleClick();
        }
      }, 50);
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  };

  const getButtonClass = () => {
    if (isLongPressing) {
      return 'aura-button bg-red-600 animate-pulse-alert';
    }
    
    switch (state) {
      case AuraState.ACTIVE:
        return 'aura-button aura-button-active';
      case AuraState.ALERT:
        return 'aura-button aura-button-alert';
      case AuraState.SOS_ACTIVE:
        return 'aura-button bg-green-600';
      default:
        return 'aura-button aura-button-idle';
    }
  };

  const getButtonText = () => {
    if (isLongPressing) {
      return 'Hold for SOS\nEmergency Alert';
    }
    
    switch (state) {
      case AuraState.ACTIVE:
        return 'Aura is Active\nI\'m listening...';
      case AuraState.ALERT:
        return 'Alert Sent\nStay Safe';
      case AuraState.SOS_ACTIVE:
        return 'SOS Alert Sent\nHelp is Coming';
      default:
        return 'Activate Aura';
    }
  };

  const getStatusText = () => {
    if (isLongPressing) {
      return 'Activating emergency alert...';
    }
    
    switch (state) {
      case AuraState.ACTIVE:
        return 'Listening for your safety';
      case AuraState.ALERT:
        return 'Emergency contacts notified';
      case AuraState.SOS_ACTIVE:
        return 'Critical alert sent - authorities notified';
      default:
        return 'Tap to activate personal safety AI';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled}
        className={`${getButtonClass()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={`${getButtonText()}. Hold for 2 seconds for emergency SOS alert.`}
      >
        {/* Wave visualizer for active state */}
        {(state === AuraState.ACTIVE || isLongPressing) && (
          <>
            <div className="wave-visualizer" style={{ animationDelay: '0s' }} />
            <div className="wave-visualizer" style={{ animationDelay: '0.5s' }} />
            <div className="wave-visualizer" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        <span className="text-center leading-tight whitespace-pre-line relative z-10">
          {getButtonText()}
        </span>
      </button>
      
      <p className="text-gray-600 text-center text-sm max-w-sm px-4">
        {getStatusText()}
      </p>
      
      {/* Long press instruction */}
      {state === AuraState.IDLE && (
        <p className="text-gray-400 text-center text-xs max-w-sm px-4">
          Tap to activate • Hold for 2 seconds for emergency SOS
        </p>
      )}
    </div>
  );
};