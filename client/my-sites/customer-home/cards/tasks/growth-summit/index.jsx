import { useTranslate } from 'i18n-calypso';
import React from 'react';
import growthSummitIllustration from 'calypso/assets/images/customer-home/illustration--growth-summit.svg';
import { TASK_GROWTH_SUMMIT } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

const GrowthSummit = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'The WordPress.com Growth Summit' ) }
			description={ translate(
				'Learn how to build and grow your site, from start to scale. Come join us for this exclusive two-day virtual event, August 11-13.'
			) }
			actionText={ translate( 'Register today for 20% off!' ) }
			actionUrl="http://www.wordpress.com/growth-summit/"
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ growthSummitIllustration }
			taskId={ TASK_GROWTH_SUMMIT }
		/>
	);
};

export default GrowthSummit;
