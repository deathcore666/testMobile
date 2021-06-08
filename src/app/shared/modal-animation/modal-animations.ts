import { Animation } from '@ionic/core';

/**
 * Modal Enter Animation
 */
export function EnterAnimation(AnimationC: Animation, baseEl: HTMLElement): Promise<Animation> {
  const baseAnimation = new AnimationC();

  const backdropAnimation = new AnimationC();
  backdropAnimation.addElement(baseEl.querySelector('ion-backdrop'));

  const wrapperAnimation = new AnimationC();
  wrapperAnimation.addElement(baseEl.querySelector('.modal-wrapper'));

  wrapperAnimation
    .fromTo('transform', 'translateY(-100vh)', 'translateY(0vh)')
    .fromTo('opacity', 0, 1);

  backdropAnimation.fromTo('opacity', 0.01, 0.4);

  return Promise.resolve(baseAnimation
    .addElement(baseEl)
    .easing('cubic-bezier(0.36,0.66,0.04,1)')
    .duration(400)
    .beforeAddClass('show-modal')
    .add(backdropAnimation)
    .add(wrapperAnimation));
};

/**
 * Modal Leave Animation
 */

export function myLeaveAnimation(AnimationC: Animation, baseEl: HTMLElement): Promise<Animation> {
  const baseAnimation = new AnimationC();

  const backdropAnimation = new AnimationC();
  backdropAnimation.addElement(baseEl.querySelector('ion-backdrop'));

  const wrapperAnimation = new AnimationC();

  const wrapperEl = baseEl.querySelector('.modal-wrapper');
  wrapperAnimation.addElement(wrapperEl);

  wrapperAnimation
    .fromTo('transform', 'translateY(0vh)', 'translateY(-30vh)')
    .fromTo('opacity', 1, 0);

  backdropAnimation.fromTo('opacity', 0.4, 0.01);

  return Promise.resolve(baseAnimation
    .addElement(baseEl)
    .easing('ease-out')
    .duration(400)
    .add(backdropAnimation)
    .add(wrapperAnimation));
}