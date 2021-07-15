using Jahan.Handicraft.Model.UModel.Helper;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using umbraco.NodeFactory;
using Umbraco.Core.Models;
using Umbraco.Core.Services;

namespace Jahan.Handicraft.Model.UModel
{
    public class HighlightProducts
    {
        public string LinkUrl { get; set; }
        public string Caption { get; set; }
        public string MainPicture { get; set; }
        public string Price { get; set; }
        public string FirstPartOfPrice
        {
            get
            {
                return Price.FirstPartOfString('.', string.Empty);
            }
        }
        public string SecondPartOfPrice
        {
            get
            {
                return Price.SecondPartOfString('.', string.Empty);
            }
        }
        public static List<HighlightProducts> Get(IPublishedContent content, string docTypeOfTargetNode, CultureInfo culture)
        {
            var result = new List<HighlightProducts>();
            List<RelatedLinks> rLinks = RelatedLinks.GetProperties(content, docTypeOfTargetNode, "HighlightLinks", culture);

            foreach (var lnk in rLinks)
            {
                umbraco.NodeFactory.Node node = new umbraco.NodeFactory.Node(lnk.InternalLinkId);
                if (node.NodeTypeAlias != null && node.NodeTypeAlias.Equals("Product"))
                {
                    var highlightProducts = new HighlightProducts();
                    highlightProducts.MainPicture = node.PropertiesAsList.Where(c => c.Alias.Equals("MainPicture")).FirstOrDefault()?.ToString();
                    highlightProducts.Price = node.PropertiesAsList.Where(c => c.Alias.Equals("Price")).FirstOrDefault()?.ToString();
                    highlightProducts.Caption = lnk.Caption;
                    highlightProducts.LinkUrl = lnk.LinkUrl;
                    result.Add(highlightProducts);
                }
            }
            return result;
        }
    }
}
