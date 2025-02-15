/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StreamsPreview from './streams';
import SimplePreview from 'calypso/components/activity-card/activity-media';
import type { Activity } from '../types';

/**
 * Style dependencies
 */
import './style.scss';

const MediaPreview: React.FC< { activity: Activity } > = ( { activity } ) => {
	const { streams } = activity;
	if ( streams && streams.filter( ( { activityMedia } ) => activityMedia?.available ).length > 2 ) {
		return <StreamsPreview streams={ streams } />;
	}

	const { activityMedia } = activity;
	if ( activityMedia?.available ) {
		return (
			<SimplePreview
				name={ activityMedia.name }
				thumbnail={ activityMedia.medium_url || activityMedia.thumbnail_url }
			/>
		);
	}

	return null;
};

export default MediaPreview;
