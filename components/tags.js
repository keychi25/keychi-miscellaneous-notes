import { makeStyles } from '@material-ui/core/styles'
const useStyles = makeStyles((theme) => ({
  tagA: {
    background: '#EEEEEE',
    marginRight: theme.spacing(4),
    fontSize: 14,
    color: '#666666',
  },
}))
export default function Tags({ tags }) {
  const classes = useStyles()
  const result = tags.split(' ')
  return result.map((tag) => (
    <a className={classes.tagA}>
      <span>{tag}</span>
    </a>
  ))
}
