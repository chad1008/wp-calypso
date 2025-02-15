/**
 * External dependencies
 */
import { findKey } from 'lodash';
import { generatePath, useLocation, useRouteMatch } from 'react-router-dom';
import { Plans } from '@automattic/data-stores';
import languages from '@automattic/languages';
import type { ValuesType } from 'utility-types';

/**
 * Internal dependencies
 */
import { FLOW_ID } from '../gutenboarding/constants';

type PlanPath = Plans.PlanPath;

const plansPaths = Plans.plansSlugs;

// The first step (IntentGathering), which is found at the root route (/), is set as
// `undefined`, as that's what matching our `path` pattern against a route with no explicit
// step fragment will return.
export const Step = {
	IntentGathering: undefined,
	DesignSelection: 'design',
	Style: 'style',
	Features: 'features',
	Signup: 'signup',
	Login: 'login',
	CreateSite: 'create-site',
	Domains: 'domains',
	Emails: 'emails',
	Plans: 'plans',
	DomainsModal: 'domains-modal',
	PlansModal: 'plans-modal',
	LanguageModal: 'language-modal',
} as const;

// We remove falsey `steps` with `.filter( Boolean )` as they'd mess up our |-separated route pattern.
export const steps = Object.values( Step ).filter( Boolean );

const routeFragments = {
	// We add the possibility of an empty step fragment through the `?` question mark at the end of that fragment.
	step: `:step(${ steps.join( '|' ) })?`,
	plan: `:plan(${ plansPaths.join( '|' ) })?`,
	lang: `:lang(${ languages.map( ( lang ) => lang.langSlug ).join( '|' ) })?`,
};

export const path = [ '', ...Object.values( routeFragments ) ].join( '/' );

export type StepType = ValuesType< typeof Step >;
export type StepNameType = keyof typeof Step;

export interface GutenLocationStateType {
	anchorFmPodcastId?: string;
	anchorFmEpisodeId?: string;
	anchorFmSpotifyUrl?: string;
	anchorFmSite?: string;
	anchorFmPost?: string;
	anchorFmIsNewSite?: string;
}
export type GutenLocationStateKeyType = keyof GutenLocationStateType;

export function usePath() {
	const langParam = useLangRouteParam();
	const planParam = usePlanRouteParam();

	return ( step?: StepType, lang?: string, plan?: string ): string => {
		// When lang is null, remove lang.
		// When lang is empty or undefined, get lang from route param.
		lang = lang === null ? '' : lang || langParam;
		plan = plan === null ? '' : plan || planParam;

		if ( ! step && ! lang && ! plan ) {
			return '/';
		}

		try {
			return generatePath( path, {
				step,
				plan,
				lang,
			} );
		} catch {
			// If we get an invalid lang or plan, `generatePath` throws a TypeError.
			return generatePath( path, { step } );
		}
	};
}

export function useLangRouteParam() {
	const match = useRouteMatch< { lang?: string } >( path );
	return match?.params.lang;
}

export function useStepRouteParam() {
	const match = useRouteMatch< { step?: string } >( path );
	return match?.params.step as StepType;
}

export function usePlanRouteParam() {
	const match = useRouteMatch< { plan?: PlanPath } >( path );
	return match?.params.plan;
}

export function useCurrentStep(): StepNameType {
	const stepRouteParam = useStepRouteParam();
	return findKey( Step, ( step ) => step === stepRouteParam ) as StepNameType;
}

// Returns true if the url has a `?new`, which is used by the
// CreateSite step to decide whether a site creation needs to
// be triggered.
export function useNewQueryParam() {
	return new URLSearchParams( useLocation().search ).has( 'new' );
}

export function useIsAnchorFm(): boolean {
	const { anchorFmPodcastId } = useAnchorFmParams();
	return isAnchorPodcastIdValid( anchorFmPodcastId );
}

export function isAnchorPodcastIdValid( anchorFmPodcastId: string | null ): boolean {
	return Boolean( anchorFmPodcastId && anchorFmPodcastId.match( /^[0-9a-f]{7,8}$/i ) );
}

export function useOnboardingFlow(): string {
	if ( useIsAnchorFm() ) {
		return 'anchor-fm';
	}
	return FLOW_ID;
}

export interface AnchorFmParams {
	anchorFmPodcastId: string | null;
	anchorFmEpisodeId: string | null;
	anchorFmSpotifyUrl: string | null;
	anchorFmSite: string | null;
	anchorFmPost: string | null;
	anchorFmIsNewSite: string | null;
	isAnchorFmPodcastIdError: boolean;
}
export function useAnchorFmParams(): AnchorFmParams {
	const sanitizePodcast = ( id: string ) => id.replace( /[^a-zA-Z0-9]/g, '' );
	const anchorFmPodcastId = useAnchorParameter( {
		queryParamName: 'anchor_podcast',
		locationStateParamName: 'anchorFmPodcastId',
		sanitize: sanitizePodcast,
	} );
	const isAnchorFmPodcastIdError =
		anchorFmPodcastId !== null && ! isAnchorPodcastIdValid( anchorFmPodcastId );

	// Allow all characters allowed in urls
	// Reserved characters: !*'();:@&=+$,/?#[]
	// Unreserved: A-Za-z0-9_.~-    (possibly % as a part of percent-encoding)
	const sanitizeEpisode = ( id: string ) => id.replace( /[^A-Za-z0-9_.\-~%]/g, '' );
	const anchorFmEpisodeId = useAnchorParameter( {
		queryParamName: 'anchor_episode',
		locationStateParamName: 'anchorFmEpisodeId',
		sanitize: sanitizeEpisode,
	} );

	// Allow all characters allowed in urls
	// Reserved characters: !*'();:@&=+$,/?#[]
	// Unreserved: A-Za-z0-9_.~-    (possibly % as a part of percent-encoding)
	const sanitizeShowUrl = ( id: string ) =>
		id.replace( /[^A-Za-z0-9_.\-~%!*'();:@&=+$,/?#[\]]/g, '' );
	const anchorFmSpotifyUrl = useAnchorParameter( {
		queryParamName: 'spotify_url',
		locationStateParamName: 'anchorFmSpotifyUrl',
		sanitize: sanitizeShowUrl,
	} );

	// "site" and "post" are strings consisting of digits only. Example URL:
	// http://wordpress.com/new?site=181129564&post=5&anchor_podcast=22b6608
	// We store them as strings for consistency with the other param types
	// and simplicity in code and type signatures.
	const sanitizeNumberParam = ( id: string ) => id.replace( /^\D+$/g, '' );
	const anchorFmSite = useAnchorParameter( {
		queryParamName: 'site',
		locationStateParamName: 'anchorFmSite',
		sanitize: sanitizeNumberParam,
	} );
	const anchorFmPost = useAnchorParameter( {
		queryParamName: 'post',
		locationStateParamName: 'anchorFmPost',
		sanitize: sanitizeNumberParam,
	} );

	// anchorFmIsNewSite:
	// Indicates the backend has told us we need to make a new site and
	// we don't need to query it anymore.
	// If we start with "/new?anchor_podcast=abcdef0", the backend might say there's
	// no matching site and redirect us to "/new?anchor_podcast=abcdef0&anchor_episode=1234-123456&anchor_is_new_site=true",
	// because it found the last episode and wanted to pass that information to us.
	// In this case, we don't need to ask the backend again after restarting gutenboarding.
	const anchorFmIsNewSite = useAnchorParameter( {
		queryParamName: 'anchor_is_new_site',
		locationStateParamName: 'anchorFmIsNewSite',
		sanitize: ( flag: string ) => ( flag === 'true' ? 'true' : 'false' ),
	} );

	return {
		anchorFmPodcastId,
		isAnchorFmPodcastIdError,
		anchorFmEpisodeId,
		anchorFmSpotifyUrl,
		anchorFmSite,
		anchorFmPost,
		anchorFmIsNewSite,
	};
}

/*
 useAnchorParameter is an internal helper for finding a value that comes from either a query string, or location state.
 Outside callers shouldn't use it, so it's not exported.

 For example, when a user hits http://calypso.localhost:3000/new?anchor_podcast=40a166a8
 We grab that anchor_podcast value, and store it in location state to keep as we move along the states.
 It's called "anchor_podcast" in the query string above, but "anchorFmPodcastId" above.

  Calling this function like so:
  useAnchorParameter({
    queryParamName: 'anchor_podcast',
    locationStateParamName: 'anchorFmPodcastId',
  })
  Looks for the value first in location state, then if it can't be found, looks in the query parameter.
*/
interface UseAnchorParameterType {
	queryParamName: string;
	locationStateParamName: GutenLocationStateKeyType;
	sanitize: ( arg0: string ) => string;
}
function useAnchorParameter( {
	queryParamName,
	locationStateParamName,
	sanitize,
}: UseAnchorParameterType ): string | null {
	const { state: locationState = {}, search } = useLocation< GutenLocationStateType >();

	// Use location state if available
	const locationStateParamValue = locationState[ locationStateParamName ];
	if ( locationState && locationStateParamValue ) {
		return sanitize( locationStateParamValue );
	}

	// Fall back to looking in query param
	const queryParamValue = new URLSearchParams( search ).get( queryParamName );
	if ( queryParamValue ) {
		return sanitize( queryParamValue );
	}
	return null;
}
