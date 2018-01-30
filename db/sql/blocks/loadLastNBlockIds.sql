/*
	DESCRIPTION: Get last N blocks ids ordered by height.

	PARAMETERS: {Limit} Number of block ids to get
*/
SELECT id FROM blocks
ORDER BY height DESC LIMIT $1
