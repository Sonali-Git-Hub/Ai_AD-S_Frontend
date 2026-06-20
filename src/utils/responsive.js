// Copied from AISA-Mobile/src/utils/responsive.js
import { Dimensions, Platform, PixelRatio } from 'react-native';
import { useState, useEffect } from 'react';

// Live bindings using let so they can be dynamically updated on screen resize / fold events
let windowDimensions = Dimensions.get('window');
export let SCREEN_WIDTH = windowDimensions.width;
export let SCREEN_HEIGHT = windowDimensions.height;

// Capped width for responsive scaling on tablets/desktops to prevent bloated elements
const getCappedWidth = (width) => Math.min(width, 540);

export let scale = (size) => (getCappedWidth(SCREEN_WIDTH) / 375) * size;
export let verticalScale = (size) => (SCREEN_HEIGHT / 812) * size;
export let moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export let rf = (size) => {
    const scaleFactor = getCappedWidth(SCREEN_WIDTH) / 375;
    const newSize = size * scaleFactor;
    // Cap font growth on very large screens to prevent giant text
    const cappedSize = SCREEN_WIDTH > 1024 ? size * 1.5 : newSize;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(cappedSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(cappedSize)) - (SCREEN_WIDTH > 600 ? 0 : 1);
    }
};

export let isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;
export let isDesktop = SCREEN_WIDTH >= 1024 || Platform.OS === 'macos';
export let isMobile = SCREEN_WIDTH < 768;
export let isLargeScreen = isDesktop || isTablet;
export let isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;

export const Device = {
  isMobile: SCREEN_WIDTH < 768,
  isTablet: SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024,
  isDesktop: SCREEN_WIDTH >= 1024 || Platform.OS === 'macos',
  isFoldable: SCREEN_WIDTH > 600 && SCREEN_WIDTH < 900,
};

export let wp = (percentage) => (percentage * SCREEN_WIDTH) / 100;
export let hp = (percentage) => (percentage * SCREEN_HEIGHT) / 100;

export let width = SCREEN_WIDTH;
export let height = SCREEN_HEIGHT;

// Dynamic listener to update live bindings on orientation change, foldable folding/unfolding, or desktop window resizing
Dimensions.addEventListener('change', ({ window }) => {
    SCREEN_WIDTH = window.width;
    SCREEN_HEIGHT = window.height;
    width = window.width;
    height = window.height;

    isTablet = window.width >= 768 && window.width < 1024;
    isDesktop = window.width >= 1024 || Platform.OS === 'macos';
    isMobile = window.width < 768;
    isLargeScreen = isDesktop || isTablet;
    isLandscape = window.width > window.height;

    Device.isMobile = window.width < 768;
    Device.isTablet = window.width >= 768 && window.width < 1024;
    Device.isDesktop = window.width >= 1024 || Platform.OS === 'macos';
    Device.isFoldable = window.width > 600 && window.width < 900;

    scale = (size) => (getCappedWidth(window.width) / 375) * size;
    verticalScale = (size) => (window.height / 812) * size;
    moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

    rf = (size) => {
        const scaleFactor = getCappedWidth(window.width) / 375;
        const newSize = size * scaleFactor;
        const cappedSize = window.width > 1024 ? size * 1.5 : newSize;
        if (Platform.OS === 'ios') {
            return Math.round(PixelRatio.roundToNearestPixel(cappedSize));
        } else {
            return Math.round(PixelRatio.roundToNearestPixel(cappedSize)) - (window.width > 600 ? 0 : 1);
        }
    };

    wp = (percentage) => (percentage * window.width) / 100;
    hp = (percentage) => (percentage * window.height) / 100;
});

/**
 * useResponsive React Hook
 */
export const useResponsive = () => {
    const [dims, setDims] = useState(Dimensions.get('window'));
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDims(window);
        });
        return () => subscription.remove();
    }, []);
    const W = dims.width;
    const H = dims.height;
    const currentScale = (size) => (getCappedWidth(W) / 375) * size;
    const currentVerticalScale = (size) => (H / 812) * size;
    const currentModerateScale = (size, factor = 0.5) => size + (currentScale(size) - size) * factor;
    const currentRf = (size) => {
        const scaleFactor = getCappedWidth(W) / 375;
        const newSize = size * scaleFactor;
        const cappedSize = W > 1024 ? size * 1.5 : newSize;
        if (Platform.OS === 'ios') {
            return Math.round(PixelRatio.roundToNearestPixel(cappedSize));
        } else {
            return Math.round(PixelRatio.roundToNearestPixel(cappedSize)) - (W > 600 ? 0 : 1);
        }
    };
    return {
        width: W,
        height: H,
        scale: currentScale,
        verticalScale: currentVerticalScale,
        moderateScale: currentModerateScale,
        rf: currentRf,
        isTablet: W >= 768 && W < 1024,
        isDesktop: W >= 1024 || Platform.OS === 'macos',
        isMobile: W < 768,
        isLargeScreen: W >= 768 || Platform.OS === 'macos',
        isLandscape: W > H,
        wp: (percentage) => (percentage * W) / 100,
        hp: (percentage) => (percentage * H) / 100,
    };
};

export default {
    scale,
    verticalScale,
    moderateScale,
    rf,
    isTablet,
    isDesktop,
    isMobile,
    isLargeScreen,
    isLandscape,
    wp,
    hp,
    width,
    height,
    Device,
};
