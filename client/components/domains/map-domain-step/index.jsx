/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { modeType, stepType } from './constants';
import MapDomainStepsSuggested from 'calypso/components/domains/map-domain-step/map-domain-steps-suggested';
import MapDomainStepsAdvanced from 'calypso/components/domains/map-domain-step/map-domain-steps-advanced';

/**
 * Style dependencies
 */
import './style.scss';

const stepComponent = {
	[ modeType.SUGGESTED ]: MapDomainStepsSuggested,
	[ modeType.ADVANCED ]: MapDomainStepsAdvanced,
};

export default function MapDomainStep( { domain } ) {
	const [ mode, setMode ] = useState( modeType.SUGGESTED );
	const [ step, setStep ] = useState( stepType.START );

	const StepsComponent = stepComponent[ mode ];

	return (
		<>
			<StepsComponent
				className="map-domain-step"
				domain={ domain }
				step={ step }
				onChangeStep={ setStep }
				onChangeMode={ setMode }
			/>
		</>
	);
}

MapDomainStep.propTypes = {
	domain: PropTypes.string.isRequired,
};

MapDomainStep.defaultProps = {
	domain: 'foo.org',
};
