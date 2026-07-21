import { Alert, Button, Flex, Input, Modal, Typography } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import { SettingsPatch } from '../../types';

const { Text } = Typography;

// Disabled state per design: brand fill at 40% opacity with inset shadows,
// instead of antd's washed-out gray.
const ConfirmButton = styled(Button)`
  &:disabled {
    border-radius: 10px;
    opacity: 0.4;
    color: #ffffff;
    border-color: transparent;
    background:
      linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%),
      #7e22ce;
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
    <Modal
      open
      title={title}
      onCancel={onClose}
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
      <Flex vertical gap={12}>
        <Text>{body}</Text>
        <label htmlFor="connect-password">
          Enter your password <Text type="danger">*</Text>
        </label>
        <Input.Password
          id="connect-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Alert type="error" showIcon message={error.message} />}
      </Flex>
    </Modal>
  );
};
