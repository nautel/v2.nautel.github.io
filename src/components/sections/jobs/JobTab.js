import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTabButton = styled.button`
  ${({ theme }) => theme.mixins.link};
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--tab-height);
  padding: 0 20px 2px;
  border-left: 2px solid var(--lightest-navy);
  background-color: transparent;
  color: ${({ isActive }) => (isActive ? 'var(--green)' : 'var(--slate)')};
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  text-align: left;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0 15px 2px;
  }
  @media (max-width: 600px) {
    ${({ theme }) => theme.mixins.flexCenter};
    min-width: 120px;
    padding: 0 15px;
    border-left: 0;
    border-bottom: 2px solid var(--lightest-navy);
    text-align: center;
  }

  &:hover,
  &:focus {
    background-color: var(--light-navy);
  }
`;

const JobTab = memo(
  ({ company, isActive, onClick, tabRef, id, tabIndex, ariaSelected, ariaControls }) => (
    <StyledTabButton
      isActive={isActive}
      onClick={onClick}
      ref={tabRef}
      id={id}
      role="tab"
      tabIndex={tabIndex}
      aria-selected={ariaSelected}
      aria-controls={ariaControls}>
      <span>{company}</span>
    </StyledTabButton>
  ),
);

JobTab.displayName = 'JobTab';

JobTab.propTypes = {
  company: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  tabRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  id: PropTypes.string.isRequired,
  tabIndex: PropTypes.string.isRequired,
  ariaSelected: PropTypes.bool.isRequired,
  ariaControls: PropTypes.string.isRequired,
};

export default JobTab;
