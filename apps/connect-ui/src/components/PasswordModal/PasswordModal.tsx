import { Alert, Button, Flex, Input, Modal, Typography } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { COLOR } from '../../constants/theme';
import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import { SettingsPatch } from '../../types';

const { Text } = Typography;

// Modal chrome per Figma: 464px wide, 24px padding, 12px (Spacing/md) radius,
// 3px translucent-white border, 20px/500/28px title, black close icon, and a
// 12px gap between the footer buttons.
const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 24px;
    border-radius: 12px;
    border: 3px solid rgba(255, 255, 255, 0.25);
  }

  .ant-modal-header {
    margin-bottom: 24px;
  }

  .ant-modal-title {
    font-weight: 500;
    font-size: 20px;
    line-height: 28px;
    color: ${COLOR.TEXT_TITLE};
  }

  .ant-modal-close {
    top: 24px;
    inset-inline-end: 24px;
    color: ${COLOR.BLACK};
  }

  .ant-modal-close-icon {
    color: ${COLOR.BLACK};
  }

  .ant-modal-body {
    margin-bottom: 24px;
  }

  .ant-modal-footer {
    margin-top: 0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .ant-modal-footer > .ant-btn + .ant-btn {
    margin-inline-start: 0;
  }
`;

// Explanatory body copy — 16px / 400 / 24px, rgba(54, 63, 73, 1).
const BodyText = styled.p`
  margin: 0;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: ${COLOR.TEXT_SECONDARY};
`;

// Field label — 14px tertiary, matching Pearl's password fields.
const PasswordLabel = styled.label`
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_TERTIARY};
`;

// Password field styled like Pearl's (olas-operate-app): small size, 6px 12px
// padding, 16px text.
const PasswordField = styled(Input.Password)`
  padding: 6px 12px;

  input.ant-input {
    font-size: 16px;
  }
`;

// Disabled state per design: brand fill at 40% opacity with inset shadows,
// instead of antd's washed-out gray.
const ConfirmButton = styled(Button)`
  &:disabled {
    border-radius: 10px;
    opacity: 0.4;
    color: ${COLOR.WHITE};
    border-color: transparent;
    background:
      linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%), ${COLOR.PRIMARY};
    background-blend-mode: overlay, normal;
    box-shadow:
      0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
      0 0 0 1px rgba(0, 0, 0, 0.1) inset,
      0 -4px 16px 0 rgba(255, 255, 255, 0.24) inset,
      0 4px 16px 0 rgba(255, 255, 255, 0.24) inset,
      0 0 0 2px rgba(255, 255, 255, 0.12) inset;
  }
`;

type PasswordModalProps = {
  title: string;
  body: string;
  confirmLabel: string;
  /** The merge-patch to submit; the password is appended on confirm. */
  patch: Omit<SettingsPatch, 'password'>;
  onClose: () => void;
};

export const PasswordModal = ({
  title,
  body,
  confirmLabel,
  patch,
  onClose,
}: PasswordModalProps) => {
  const [password, setPassword] = useState('');
  const { mutate, isPending, error } = useUpdateSettings();

  const handleConfirm = () => {
    mutate({ ...patch, password }, { onSuccess: onClose });
  };

  return (
    <StyledModal
      open
      width={464}
      title={title}
      onCancel={onClose}
      styles={{ mask: { backgroundColor: COLOR.MASK } }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <ConfirmButton
          key="confirm"
          type="primary"
          disabled={!password}
          loading={isPending}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </ConfirmButton>,
      ]}
    >
      <Flex vertical gap={24}>
        <BodyText>{body}</BodyText>
        <Flex vertical gap={4}>
          <PasswordLabel htmlFor="connect-password">
            Enter your password <Text type="danger">*</Text>
          </PasswordLabel>
          <PasswordField
            id="connect-password"
            size="small"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Flex>
        {error && <Alert type="error" showIcon message={error.message} />}
      </Flex>
    </StyledModal>
  );
};
