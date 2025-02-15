import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import {
	NOTICE_CELEBRATE_SITE_CREATION,
	NOTICE_CELEBRATE_SITE_LAUNCH,
	NOTICE_CELEBRATE_SITE_MIGRATION,
	NOTICE_CELEBRATE_SITE_SETUP_COMPLETE,
	TASK_CLOUDFLARE,
	TASK_CONNECT_ACCOUNTS,
	TASK_EARN_FEATURES,
	TASK_FIND_DOMAIN,
	TASK_GO_MOBILE_ANDROID,
	TASK_GO_MOBILE_IOS,
	TASK_GROWTH_SUMMIT,
	TASK_PODCASTING,
	TASK_RENEW_EXPIRED_PLAN,
	TASK_RENEW_EXPIRING_PLAN,
	TASK_SITE_SETUP_CHECKLIST_ECOMMERCE,
	TASK_SITE_SETUP_CHECKLIST,
	TASK_UPSELL_TITAN,
	TASK_VERIFY_EMAIL,
	TASK_WEBINARS,
	TASK_WP_COURSES,
} from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateSiteCreation from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-creation';
import CelebrateSiteLaunch from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-launch';
import CelebrateSiteMigration from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-migration';
import CelebrateSiteSetupComplete from 'calypso/my-sites/customer-home/cards/notices/celebrate-site-setup-complete';
import Cloudflare from 'calypso/my-sites/customer-home/cards/tasks/cloudflare';
import ConnectAccounts from 'calypso/my-sites/customer-home/cards/tasks/connect-accounts';
import EarnFeatures from 'calypso/my-sites/customer-home/cards/tasks/earn-features';
import FindDomain from 'calypso/my-sites/customer-home/cards/tasks/find-domain';
import GoMobile from 'calypso/my-sites/customer-home/cards/tasks/go-mobile';
import GrowthSummit from 'calypso/my-sites/customer-home/cards/tasks/growth-summit';
import Podcasting from 'calypso/my-sites/customer-home/cards/tasks/podcasting';
import Renew from 'calypso/my-sites/customer-home/cards/tasks/renew';
import SiteSetupListEcommerce from 'calypso/my-sites/customer-home/cards/tasks/site-setup-checklist-ecommerce';
import SiteSetupList from 'calypso/my-sites/customer-home/cards/tasks/site-setup-list';
import TitanBanner from 'calypso/my-sites/customer-home/cards/tasks/titan-banner';
import VerifyEmail from 'calypso/my-sites/customer-home/cards/tasks/verify-email';
import Webinars from 'calypso/my-sites/customer-home/cards/tasks/webinars';
import WPCourses from 'calypso/my-sites/customer-home/cards/tasks/wp-courses';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

const cardComponents = {
	[ NOTICE_CELEBRATE_SITE_CREATION ]: CelebrateSiteCreation,
	[ NOTICE_CELEBRATE_SITE_LAUNCH ]: CelebrateSiteLaunch,
	[ NOTICE_CELEBRATE_SITE_MIGRATION ]: CelebrateSiteMigration,
	[ NOTICE_CELEBRATE_SITE_SETUP_COMPLETE ]: CelebrateSiteSetupComplete,
	[ TASK_CONNECT_ACCOUNTS ]: ConnectAccounts,
	[ TASK_EARN_FEATURES ]: EarnFeatures,
	[ TASK_FIND_DOMAIN ]: FindDomain,
	[ TASK_GO_MOBILE_ANDROID ]: GoMobile,
	[ TASK_GO_MOBILE_IOS ]: GoMobile,
	[ TASK_GROWTH_SUMMIT ]: GrowthSummit,
	[ TASK_PODCASTING ]: Podcasting,
	[ TASK_RENEW_EXPIRED_PLAN ]: Renew,
	[ TASK_RENEW_EXPIRING_PLAN ]: Renew,
	[ TASK_SITE_SETUP_CHECKLIST ]: SiteSetupList,
	[ TASK_UPSELL_TITAN ]: TitanBanner,
	[ TASK_SITE_SETUP_CHECKLIST_ECOMMERCE ]: SiteSetupListEcommerce,
	[ TASK_WEBINARS ]: Webinars,
	[ TASK_WP_COURSES ]: WPCourses,
	[ TASK_CLOUDFLARE ]: Cloudflare,
	[ TASK_VERIFY_EMAIL ]: VerifyEmail,
};

const Primary = ( { cards, trackCards } ) => {
	useEffect( () => {
		if ( cards && cards.length ) {
			trackCards( cards );
		}
	}, [ cards, trackCards ] );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map(
				( card, index ) =>
					cardComponents[ card ] &&
					React.createElement( cardComponents[ card ], {
						key: index,
						isIos: card === 'home-task-go-mobile-ios' ? true : null,
						card,
					} )
			) }
		</>
	);
};

const trackCardImpressions = ( cards ) => {
	const analyticsEvents = cards.reduce( ( events, card ) => {
		return [
			...events,
			recordTracksEvent( 'calypso_customer_home_card_impression', { card } ),
			bumpStat( 'calypso_customer_home_card_impression', card ),
		];
	}, [] );
	return composeAnalytics( ...analyticsEvents );
};

export default withPerformanceTrackerStop(
	connect( null, { trackCards: trackCardImpressions } )( Primary )
);
