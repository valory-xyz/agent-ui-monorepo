import { X_POST_URL } from '@agent-ui-monorepo/util-constants-and-types';
import { Col, Flex, Row, Spin, Typography } from 'antd';
import { FC } from 'react';
import styled from 'styled-components';

import mediaEmptyLogo from '../assets/media-empty.png';
import { COLOR } from '../constants/theme';
import { useGeneratedMedia } from '../hooks/useGeneratedMedia';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';

const { Title } = Typography;

const MediaContainer = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 2px;
  background: ${COLOR.GRAY_1};
  overflow: hidden;

  &:hover .view-on-x {
    opacity: 1;
  }
`;

const ViewOnXContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: ${COLOR.WHITE};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  background: ${COLOR.BLACK_TRANSPARENT_1};
  backdrop-filter: blur(2px);
`;

const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
`;

const Loader: FC = () => (
  <Flex justify="center" align="center" style={{ height: 140, width: '100%' }}>
    <Spin />
  </Flex>
);

const NoMedia: FC = () => (
  <EmptyState
    logo={mediaEmptyLogo}
    message={
      <Flex vertical justify="center" align="center">
        <span>No media generated yet.</span>
        <span>Your agent is still gathering inspiration.</span>
      </Flex>
    }
  />
);

const ErrorMedia: FC = () => <ErrorState message="Failed to load media. Please try again later." />;

type GeneratedImageProps = { path: string; postId: string; alt: string };
const GeneratedImage: FC<GeneratedImageProps> = ({ path, postId, alt }) => (
  <Image src={path} alt={alt} onClick={() => window.open(`${X_POST_URL}/${postId}`, '_blank')} />
);

type GeneratedVideoProps = { path: string; postId: string };
const GeneratedVideo: FC<GeneratedVideoProps> = ({ path, postId }) => (
  <Video
    src={path}
    controls
    muted
    playsInline
    onClick={() => window.open(`${X_POST_URL}/${postId}`, '_blank')}
    onPlay={(e) => e.currentTarget.pause()}
  />
);

const Media: FC = () => {
  const { isLoading, isError, data: media } = useGeneratedMedia();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMedia />;
  if (!media || media.length === 0) return <NoMedia />;

  return (
    <Row gutter={[4, 4]}>
      {media.map((activity, index) => (
        <Col key={activity.postId} span={6}>
          <MediaContainer>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {activity.type === 'image' ? (
                <GeneratedImage
                  path={activity.path}
                  postId={activity.postId}
                  alt={`Generated media ${index + 1}`}
                />
              ) : activity.type === 'video' ? (
                <GeneratedVideo path={activity.path} postId={activity.postId} />
              ) : (
                'Unknown media type'
              )}
              <ViewOnXContainer className="view-on-x">View on X</ViewOnXContainer>
            </div>
          </MediaContainer>
        </Col>
      ))}
    </Row>
  );
};

export const AiGeneratedMedia: FC = () => (
  <Card>
    <Flex vertical gap={24} style={{ width: '100%' }}>
      <Title level={4} className="m-0">
        AI Generated Media
      </Title>
      <Media />
    </Flex>
  </Card>
);
