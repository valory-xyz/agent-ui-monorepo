import mediaEmptyLogo from '../assets/media-empty.png';
import { Card } from './ui/Card';
import { Col, Flex, Row, Spin, Typography } from 'antd';
import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { FC } from 'react';
import styled from 'styled-components';
import { useGeneratedMedia } from '../hooks/useGeneratedMedia';

const { Title } = Typography;

// TODO: image is being squeezed, fix it
const MediaContainer = styled.div`
  width: 160px;
  height: 160px;
  border: 1px solid #eeeeee;
  border-radius: 2px;
  background: #fafafa;
  overflow: hidden;
`;

const ViewOnXContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
`;

const Image = styled('img')`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  cursor: pointer;
  display: block;

  &:hover {
    transform: scale(1.05);
  }
`;

const Loader: FC = () => (
  <Flex justify="center" align="center" style={{ height: 140, width: '100%' }}>
    <Spin />
  </Flex>
);

const NoActivity: FC = () => (
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
  <Image
    src={path}
    alt={alt}
    onClick={() => window.open(`https://x.com/i/web/status/${postId}`, '_blank')}
    onMouseOver={(e) => ((e.currentTarget.nextSibling as HTMLElement).style.opacity = '1')}
    onMouseOut={(e) => ((e.currentTarget.nextSibling as HTMLElement).style.opacity = '0')}
  />
);

const Media: FC = () => {
  const { isLoading, isError, data: media } = useGeneratedMedia();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMedia />;
  if (!media) return <NoActivity />;

  return (
    <Row gutter={[4, 4]}>
      {media.map((activity, index) => (
        <Col key={activity.postId} span={6}>
          <MediaContainer>
            <div style={{ position: 'relative', width: '100%', height: '100%' }} tabIndex={0}>
              {activity.type === 'image' ? (
                <GeneratedImage
                  path={activity.path}
                  postId={activity.postId}
                  alt={`Generated media ${index + 1}`}
                />
              ) : activity.type === 'video' ? (
                <video
                  src={activity.path}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    window.open(`https://x.com/i/web/status/${activity.postId}`, '_blank')
                  }
                />
              ) : (
                'Unknown media type'
              )}

              <ViewOnXContainer>View on X</ViewOnXContainer>
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
