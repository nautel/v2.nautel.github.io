import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { ANIMATION_DURATIONS } from '@constants';

const StyledTabPanel = styled.div`
  width: 100%;
  height: auto;
  padding: 10px 5px;

  ul {
    ${({ theme }) => theme.mixins.fancyList};
  }

  h3 {
    margin-bottom: 2px;
    font-size: var(--fz-xxl);
    font-weight: 500;
    line-height: 1.3;

    .company {
      color: var(--green);
    }
  }

  .range {
    margin-bottom: 25px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }
`;

const JobPanel = memo(
  ({ isActive, title, company, url, range, html, id, tabIndex, ariaLabelledBy, ariaHidden }) => (
    <CSSTransition
      key={id}
      in={isActive}
      timeout={ANIMATION_DURATIONS.FADE_TRANSITION}
      classNames="fade">
      <StyledTabPanel
        id={id}
        role="tabpanel"
        tabIndex={tabIndex}
        aria-labelledby={ariaLabelledBy}
        aria-hidden={ariaHidden}
        hidden={!isActive}>
        <h3>
          <span>{title}</span>
          <span className="company">
            &nbsp;@&nbsp;
            <a href={url} className="inline-link">
              {company}
            </a>
          </span>
        </h3>

        <p className="range">{range}</p>

        <div dangerouslySetInnerHTML={{ __html: html }} />
      </StyledTabPanel>
    </CSSTransition>
  ),
);

JobPanel.displayName = 'JobPanel';

JobPanel.propTypes = {
  isActive: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  range: PropTypes.string.isRequired,
  html: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  tabIndex: PropTypes.string.isRequired,
  ariaLabelledBy: PropTypes.string.isRequired,
  ariaHidden: PropTypes.bool.isRequired,
};

export default JobPanel;
