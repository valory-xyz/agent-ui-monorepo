import { agentChainName } from '../agentMap';

const image = new Image();
image.src = `/logos/networks/${agentChainName}-network.png`;

export const DonutCenterLogoPlugin = {
  id: 'logo',
  // @ts-expect-error TODO: To be fixed
  beforeDraw: (chart) => {
    const { ctx, width, height } = chart;
    const imageSize = 35; // Set image size to 24px

    ctx.save();

    // Calculate center position
    const centerX = (width - imageSize) / 2;
    const centerY = (height - imageSize) / 2;

    if (image.complete) {
      ctx.drawImage(image, centerX, centerY, imageSize, imageSize);
    } else {
      image.onload = () => {
        ctx.drawImage(image, centerX, centerY, imageSize, imageSize);
      };
    }

    ctx.restore();
  },
};
